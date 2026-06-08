import pool from '../../config/db.js';

class SpecialistRepository {
    
  async findAll() {
    const query = `
      SELECT 
        s.id as specialist_id, s.specialization, s.qualification, s.years_of_experience, s.bio, s.photo_url, s.is_active, s.price,
        u.id as user_id, u.first_name, u.last_name, u.middle_name, u.email, u.phone,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
        COUNT(r.id)::int AS total_reviews
      FROM specialists s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN reviews r ON s.id = r.specialist_id
      WHERE s.is_active = true
      GROUP BY s.id, u.id
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = `
      SELECT 
        s.id as specialist_id, s.specialization, s.qualification, s.years_of_experience, s.bio, s.photo_url, s.is_active, s.price,
        u.id as user_id, u.first_name, u.last_name, u.middle_name, u.email, u.phone,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
        COUNT(r.id)::int AS total_reviews
      FROM specialists s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN reviews r ON s.id = r.specialist_id
      WHERE s.id = $1
      GROUP BY s.id, u.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async updateProfile(id, data) {
    const { specialization, qualification, years_of_experience, bio, photo_url, price } = data;
    const query = `
      UPDATE specialists 
      SET 
        specialization = COALESCE($1, specialization),
        qualification = COALESCE($2, qualification),
        years_of_experience = COALESCE($3, years_of_experience),
        bio = COALESCE($4, bio),
        photo_url = COALESCE($5, photo_url),
        price = COALESCE($6, price),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [
      specialization, qualification, years_of_experience, bio, photo_url, price, id
    ]);
    return result.rows[0];
  }

async getUniqueSpecializations() {
  const query = `
    SELECT DISTINCT specialization 
    FROM specialists 
    WHERE specialization IS NOT NULL AND is_active = true
    ORDER BY specialization ASC
  `;
  const result = await pool.query(query);
  return result.rows.map(row => row.specialization);
}
}

export default new SpecialistRepository();