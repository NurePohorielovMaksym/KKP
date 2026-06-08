import pool from '../../config/db.js';

const reviewRepository = {

  async getBySpecialist(specialistId) {
    const { rows } = await pool.query(
      `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at,
              u.email AS user_email
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.specialist_id = $1
       ORDER BY r.created_at DESC`,
      [specialistId]
    );
    return rows;
  },

  async getStats(specialistId) {
    const { rows } = await pool.query(
      `SELECT 
         COUNT(*)::int AS total,
         ROUND(AVG(rating)::numeric, 1) AS average
       FROM reviews
       WHERE specialist_id = $1`,
      [specialistId]
    );
    return rows[0];
  },

  async findExisting(userId, specialistId) {
    const { rows } = await pool.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND specialist_id = $2`,
      [userId, specialistId]
    );
    return rows[0] || null;
  },

  async create({ userId, specialistId, rating, comment }) {
    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, specialist_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [userId, specialistId, rating, comment]
    );
    return rows[0];
  },

  async deleteById(id) {
    const { rows } = await pool.query(
      `DELETE FROM reviews WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0] || null;
  },

  async deleteOwn(id, userId) {
    const { rows } = await pool.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async hasCompletedAppointment(userId, specialistId) {
  const { rows } = await pool.query(
    `SELECT id FROM appointments 
     WHERE user_id = $1 
       AND specialist_id = $2 
       AND status = 'completed'
     LIMIT 1`,
    [userId, specialistId]
  );
  return rows.length > 0;
},
};



export default reviewRepository;