import pool from '../../config/db.js';

class RehabilitationTypeRepository {
  async getAll() {
    const res = await pool.query('SELECT * FROM rehabilitation_types WHERE is_active = true ORDER BY name ASC');
    return res.rows;
  }

  async getById(id) {
    const res = await pool.query('SELECT * FROM rehabilitation_types WHERE id = $1', [id]);
    return res.rows[0];
  }

  async create(data) {
    const { name, description, duration_minutes, price, category, photo_url_rehab } = data;
    const query = `
      INSERT INTO rehabilitation_types (name, description, duration_minutes, price, category, photo_url_rehab, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *;
    `;
    const res = await pool.query(query, [name, description, duration_minutes, price, category, photo_url_rehab]);
    return res.rows[0];
  }

  async update(id, data) {
    const { name, description, duration_minutes, price, category, photo_url_rehab, is_active } = data;
    const query = `
      UPDATE rehabilitation_types
      SET name = $1, description = $2, duration_minutes = $3, price = $4, category = $5, photo_url_rehab = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *;
    `;
    const res = await pool.query(query, [name, description, duration_minutes, price, category, photo_url_rehab, is_active, id]);
    return res.rows[0];
  }

  async delete(id) {
  const query = 'DELETE FROM rehabilitation_types WHERE id = $1 RETURNING *';
  const res = await pool.query(query, [id]);
  return res.rows[0];
}

async getBySpecialization(specialization) {
  const res = await pool.query(
    `SELECT * FROM rehabilitation_types 
     WHERE is_active = true AND category  = $1 
     ORDER BY name ASC`,
    [specialization]
  );
  return res.rows;
}

async getByCategory(category) {
  const res = await pool.query(
    'SELECT * FROM rehabilitation_types WHERE category = $1 AND is_active = true ORDER BY name ASC',
    [category]
  );
  return res.rows;
}

}

export default new RehabilitationTypeRepository();