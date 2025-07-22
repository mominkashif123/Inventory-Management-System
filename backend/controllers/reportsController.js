const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const { executeQuery } = require('../config/database');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

class ReportsController {
  // Sales summary: total sales, total revenue
  static async salesSummary(req, res) {
    try {
      const result = await executeQuery('SELECT COUNT(*) AS total_sales, COALESCE(SUM(total),0) AS total_revenue FROM sales');
      res.json({ success: true, data: result.data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Inventory value: sum of (quantity * value) for all products
  static async inventoryValue(req, res) {
    try {
      const result = await executeQuery('SELECT COALESCE(SUM(quantity * value),0) AS inventory_value FROM products');
      res.json({ success: true, data: result.data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Bestsellers: top 10 products by quantity sold
  static async bestsellers(req, res) {
    try {
      const result = await executeQuery(`
        SELECT p.id, p.name, SUM(si.quantity) AS total_sold
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 10
      `);
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Low-stock products: quantity < 100
  static async lowStockProducts(req, res) {
    try {
      const result = await executeQuery('SELECT * FROM products WHERE quantity < 100');
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Monthly orders report: all sales for a given month
  static async monthlyOrders(req, res) {
    try {
      const { month } = req.query; // e.g., '2024-07'
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ success: false, error: 'Invalid or missing month (expected YYYY-MM)' });
      }
      const start = `${month}-01`;
      const end = `${month}-31`;
      // Get all sales in the month
      const salesResult = await executeQuery(
        'SELECT * FROM sales WHERE created_at >= $1 AND created_at < (date_trunc(\'month\', $2::date) + interval \'1 month\') ORDER BY created_at ASC',
        [start, start]
      );
      if (!salesResult.success) return res.status(500).json(salesResult);
      const sales = salesResult.data;
      if (sales.length === 0) return res.json({ success: true, data: [] });
      const saleIds = sales.map(s => s.id);
      // Get all sale items for these sales, joined with product name
      const itemsResult = await executeQuery(`
        SELECT si.*, p.name as product_name, p.part_number as product_part_number
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ANY($1)
      `, [saleIds]);
      let itemsBySale = {};
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
      // Attach items to each sale
      const salesWithItems = sales.map(({ user_id, ...sale }) => ({
        ...sale,
        items: itemsBySale[sale.id] || []
      }));
      res.json({ success: true, data: salesWithItems });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Monthly orders PDF report: all sales for a given month as a PDF
  static async monthlyOrdersPdf(req, res) {
    try {
      const { month } = req.query; // e.g., '2024-07'
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ success: false, error: 'Invalid or missing month (expected YYYY-MM)' });
      }
      const start = `${month}-01`;
      // Get all sales in the month
      const salesResult = await executeQuery(
        'SELECT * FROM sales WHERE created_at >= $1 AND created_at < (date_trunc(\'month\', $2::date) + interval \'1 month\') ORDER BY created_at ASC',
        [start, start]
      );
      if (!salesResult.success) return res.status(500).json(salesResult);
      const sales = salesResult.data;
      if (sales.length === 0) {
        // Return a PDF with a message
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="sales-report-${month}.pdf"`);
        doc.text(`Sales Report for ${month}`);
        doc.text('No sales found for this month.');
        doc.end();
        return doc.pipe(res);
      }
      const saleIds = sales.map(s => s.id);
      // Get all sale items for these sales, joined with product name
      const itemsResult = await executeQuery(`
        SELECT si.*, p.name as product_name, p.part_number as product_part_number
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ANY($1)
      `, [saleIds]);
      let itemsBySale = {};
      if (itemsResult.success) {
        for (const item of itemsResult.data) {
          if (!itemsBySale[item.sale_id]) itemsBySale[item.sale_id] = [];
          itemsBySale[item.sale_id].push({
            id: item.id,
            product_id: item.product_id,
            name: item.product_name,
            part_number: item.part_number,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
      // Generate PDF
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sales-report-${month}.pdf"`);
      doc.fontSize(18).text(`Sales Report for ${month}`, { align: 'center' });
      doc.moveDown();
      sales.forEach((sale, idx) => {
        doc.fontSize(14).text(`Order #${sale.id} - Date: ${new Date(sale.created_at).toLocaleString()}`);
        // Add customer info if present
        if (sale.customer_name || sale.customer_email || sale.customer_number) {
          let customerInfo = '';
          if (sale.customer_name) customerInfo += `Customer: ${sale.customer_name}`;
          if (sale.customer_email) customerInfo += `${customerInfo ? ' | ' : ''}Email: ${sale.customer_email}`;
          if (sale.customer_number) customerInfo += `${customerInfo ? ' | ' : ''}Number: ${sale.customer_number}`;
          doc.fontSize(12).text(customerInfo);
        }
        doc.fontSize(12).text(`Total: $${sale.total}`);
        const items = itemsBySale[sale.id] || [];
        if (items.length > 0) {
          doc.text('Items:');
          items.forEach(item => {
            doc.text(`  - ${item.name} (${item.part_number || ''}) x${item.quantity} @ $${item.price}`);
          });
        } else {
          doc.text('No items for this order.');
        }
        doc.moveDown();
        if ((idx + 1) % 5 === 0) doc.addPage(); // Add a new page every 5 orders for readability
      });
      doc.end();
      doc.pipe(res);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get sales for the current month, grouped by day, for sales trend line graph
  static async recentSales(req, res) {
    try {
      // Support ?month=MM&year=YYYY&view=yearly&last7=true
      const now = new Date();
      const month = Number(req.query.month) || (now.getMonth() + 1);
      const year = Number(req.query.year) || now.getFullYear();
      const view = req.query.view;
      const last7 = req.query.last7 === 'true';
      if (last7) {
        // Return last 7 days of individual sales (not grouped)
        const result = await executeQuery(`
          SELECT * FROM sales WHERE created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.data });
      } else if (view === 'yearly') {
        // Return month-by-month sales for the selected year
        const start = `${year}-01-01`;
        const result = await executeQuery(`
          SELECT
            TO_CHAR(d.month, 'YYYY-MM') AS month,
            COALESCE(SUM(s.total), 0) AS total_sales
          FROM
            generate_series(
              $1::date,
              ($1::date + INTERVAL '1 year - 1 month')::date,
              INTERVAL '1 month'
            ) AS d(month)
          LEFT JOIN sales s ON DATE_TRUNC('month', s.created_at) = d.month
          GROUP BY d.month
          ORDER BY d.month ASC
        `, [start]);
        res.json({ success: true, data: result.data });
      } else {
        // Default: day-by-day for the selected month/year
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const result = await executeQuery(`
          SELECT
            TO_CHAR(d.day, 'YYYY-MM-DD') AS day,
            COALESCE(SUM(s.total), 0) AS total_sales
          FROM
            generate_series(
              $1::date,
              (date_trunc('month', $1::date) + INTERVAL '1 month - 1 day')::date,
              INTERVAL '1 day'
            ) AS d(day)
          LEFT JOIN sales s ON DATE_TRUNC('day', s.created_at) = d.day
          GROUP BY d.day
          ORDER BY d.day ASC
        `, [start]);
        res.json({ success: true, data: result.data });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ReportsController; 