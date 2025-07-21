const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');

class SalesController {
  static async createSale(req, res) {
    try {
      const { user_id, items, payment_method, customer_name = null, customer_email = null, customer_number = null } = req.body; // items: [{product_id, quantity, price}]
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'No sale items provided' });
      }
      let total = 0;
      for (const item of items) {
        total += Number(item.price) * Number(item.quantity);
      }
      // Check stock for each item before proceeding
      for (const item of items) {
        const productResult = await Product.findById(item.product_id);
        if (!productResult.success || productResult.rowCount === 0) {
          return res.status(400).json({ success: false, error: `Product not found: ${item.product_id}` });
        }
        const product = productResult.data[0];
        if (Number(product.quantity) < Number(item.quantity)) {
          return res.status(400).json({ success: false, error: `Insufficient stock for product: ${product.name}` });
        }
      }
      const saleResult = await Sale.create({ user_id, total, customer_name, customer_email, customer_number });
      if (!saleResult.success) return res.status(500).json(saleResult);
      const sale = saleResult.data[0];
      // Insert sale items and update product quantities
      for (const item of items) {
        await SaleItem.create({ sale_id: sale.id, product_id: item.product_id, quantity: item.quantity, price: item.price });
        await Product.updateQuantity(item.product_id, -item.quantity);
      }
      // Send receipt email if customer_email is provided
      if (customer_email) {
        // Generate PDF receipt as a Buffer
        const doc = new PDFDocument({ margin: 40 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(buffers);
          // Setup nodemailer transporter (Gmail example)
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'momin.kashif81@gmail.com',
              pass: 'houqizvvyefeymsk'
            }
          });
          // Send the email
          await transporter.sendMail({
            from: 'thspakistan@gmail.com',
            to: customer_email,
            subject: `Your Receipt for Sale #${sale.id}`,
            text: 'Thank you for your purchase! Please find your receipt attached.',
            attachments: [{ filename: `receipt-${sale.id}.pdf`, content: pdfBuffer }]
          });
        });
        // --- PDF Styling ---
        try {
          doc.image(path.join(__dirname, 'ths.jpg'), doc.page.width / 2 - 40, 30, { width: 80 });
          doc.moveDown(10); 
        } catch (e) {
          doc.moveDown(5); 
        }
        doc.fontSize(20).fillColor('#ff6600').text('The Harley Store', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('black').text('Official Receipt', { align: 'center' });
        doc.moveDown(1.5);
        doc.fontSize(12).text(`Sale ID: ${sale.id}`);
        doc.text(`Date: ${new Date(sale.created_at).toLocaleString()}`);
        doc.text(`Customer: ${customer_name || ''}`);
        doc.text(`Email: ${customer_email}`);
        doc.text(`Phone: ${customer_number || ''}`);
        doc.moveDown();
        doc.fontSize(13).fillColor('#ff6600').text('Items:', { underline: true });
        doc.moveDown(0.5);
        items.forEach(item => {
          doc.fontSize(12).fillColor('black').text(
            `- ${item.name || item.product_id} x${item.quantity} @ $${item.price}`,
            { indent: 20 }
          );
        });
        doc.moveDown();
        doc.fontSize(14).fillColor('#ff6600').text(`Total: $${total}`, { align: 'right' });
        doc.moveDown(2);
        doc.fontSize(10).fillColor('gray').text('Thank you for your purchase!', { align: 'center' });
        doc.end();
      }
      // Audit log
      const actingUser = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: actingUser, action: 'create_sale', details: JSON.stringify({ sale_id: sale.id, items, total, payment_method }) });
      res.status(201).json({ success: true, data: sale, message: 'Sale created successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all sales
  static async getAllSales(req, res) {
    try {
      const result = await Sale.findAll();
      if (!result.success) return res.status(500).json(result);
      const sales = result.data;
      // For each sale, fetch its items and join with products to get product names
      const saleIds = sales.map(s => s.id);
      let itemsBySale = {};
      if (saleIds.length > 0) {
        // Get all sale items for these sales, joined with product name
        const { executeQuery } = require('../config/database');
        const itemsResult = await executeQuery(`
          SELECT si.*, p.name as product_name, p.part_number as product_part_number
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = ANY($1)
        `, [saleIds]);
        if (itemsResult.success) {
          for (const item of itemsResult.data) {
            if (!itemsBySale[item.sale_id]) itemsBySale[item.sale_id] = [];
            itemsBySale[item.sale_id].push({
              id: item.id,
              product_id: item.product_id,
              name: item.product_name,
              part_number: item.product_part_number,
              quantity: item.quantity,
              price: item.price
            });
          }
        }
      }
      // Attach items to each sale, and remove user_id
      const salesWithItems = sales.map(({ user_id, ...sale }) => ({
        ...sale,
        items: itemsBySale[sale.id] || []
      }));
      res.json({ success: true, data: salesWithItems });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get sale by ID (with items)
  static async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const saleResult = await Sale.findById(id);
      if (!saleResult.success || saleResult.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Sale not found' });
      }
      const { executeQuery } = require('../config/database');
      const itemsResult = await executeQuery(`
        SELECT si.*, p.name as product_name, p.part_number as product_part_number
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = $1
      `, [id]);
      const items = (itemsResult.success ? itemsResult.data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name,
        part_number: item.product_part_number,
        quantity: item.quantity,
        price: item.price
      })) : []);
      const { user_id, ...sale } = saleResult.data[0];
      res.json({ success: true, data: { ...sale, items } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SalesController; 