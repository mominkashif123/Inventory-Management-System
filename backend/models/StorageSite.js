const { executeQuery } = require('../config/database');

class StorageSite {
  // Create storage_sites table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS storage_sites (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        contact_person VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_email VARCHAR(255),
        capacity DECIMAL(10,2), -- in kg
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Get all storage sites
  static async findAll() {
    const query = 'SELECT * FROM storage_sites ORDER BY name';
    return await executeQuery(query);
  }

  // Get active storage sites only
  static async findActive() {
    const query = 'SELECT * FROM storage_sites WHERE is_active = true ORDER BY name';
    return await executeQuery(query);
  }

  // Get storage site by ID
  static async findById(id) {
    const query = 'SELECT * FROM storage_sites WHERE id = $1';
    return await executeQuery(query, [id]);
  }

  // Create new storage site
  static async create(storageSiteData) {
    const {
      name, address, contact_person, contact_phone, contact_email, capacity, notes
    } = storageSiteData;

    const query = `
      INSERT INTO storage_sites (
        name, address, contact_person, contact_phone, contact_email, capacity, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    return await executeQuery(query, [
      name, address, contact_person, contact_phone, contact_email, capacity, notes
    ]);
  }

  // Update storage site
  static async update(id, storageSiteData) {
    const {
      name, address, contact_person, contact_phone, contact_email, capacity, is_active, notes
    } = storageSiteData;

    const query = `
      UPDATE storage_sites SET 
        name = $1, address = $2, contact_person = $3, contact_phone = $4,
        contact_email = $5, capacity = $6, is_active = $7, notes = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    
    return await executeQuery(query, [
      name, address, contact_person, contact_phone, contact_email, capacity, is_active, notes, id
    ]);
  }

  // Delete storage site
  static async delete(id) {
    const query = 'DELETE FROM storage_sites WHERE id = $1 RETURNING *';
    return await executeQuery(query, [id]);
  }

  // Get storage site with inventory summary
  static async getWithInventorySummary(id) {
    const query = `
      SELECT 
        s.*,
        COUNT(p.id) as total_products,
        SUM(COALESCE(i.quantity, 0)) as total_quantity,
        SUM(COALESCE(i.quantity, 0) * p.weight_per_unit) as total_weight_kg
      FROM storage_sites s
      LEFT JOIN products p ON s.id = p.storage_site_id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE s.id = $1
      GROUP BY s.id
    `;
    return await executeQuery(query, [id]);
  }

  // Get all storage sites with inventory summary
  static async getAllWithInventorySummary() {
    const query = `
      SELECT 
        s.*,
        COUNT(p.id) as total_products,
        SUM(COALESCE(i.quantity, 0)) as total_quantity,
        SUM(COALESCE(i.quantity, 0) * p.weight_per_unit) as total_weight_kg
      FROM storage_sites s
      LEFT JOIN products p ON s.id = p.storage_site_id
      LEFT JOIN inventory i ON p.id = i.product_id
      GROUP BY s.id
      ORDER BY s.name
    `;
    return await executeQuery(query);
  }
}

module.exports = StorageSite; 