import pool from '../../config/db.js';

class AuthRepository {
  async createUser(email, passwordHash, firstName, lastName, middleName, phone) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, middle_name, phone, role) 
       VALUES ($1, $2, $3, $4, $5, $6, 'patient') RETURNING id, email, role`,
      [email, passwordHash, firstName, lastName, middleName, phone]
    );
    return result.rows[0];
  }

  async createStaffUser(userData) {
    const client = await pool.connect(); 
    try {
      await client.query('BEGIN'); 
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, middle_name, phone, role) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, role, first_name, last_name`,
        [userData.email, userData.passwordHash, userData.firstName, userData.lastName, userData.middleName, userData.phone, userData.role]
      );
      const newUser = userResult.rows[0];
      let specialistProfile = null;
      if (userData.role === 'doctor') {
        const specResult = await client.query(
          `INSERT INTO specialists (user_id, specialization, qualification, years_of_experience) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [newUser.id, userData.specialization, userData.qualification, userData.yearsOfExperience]
        );
        specialistProfile = specResult.rows[0];
      }
      await client.query('COMMIT'); 
      return { ...newUser, profile: specialistProfile };
    } catch (error) {
      await client.query('ROLLBACK'); 
      throw error;
    } finally {
      client.release(); 
    }
  }

  async getUserByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }

  async getUserByIdentifier(identifier) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR phone = $1`,
      [identifier]
    );
    return result.rows[0];
  }

  async setResetCode(userId, code, expires) {
    await pool.query(
      `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3`,
      [code, expires, userId]
    );
  }

  async getUserByCode(identifier, code) {
    const res = await pool.query(
      `SELECT id FROM users 
       WHERE (email = $1 OR phone = $1) 
         AND reset_password_token = $2 
         AND reset_password_expires > CURRENT_TIMESTAMP`,
      [identifier, code]
    );
    return res.rows[0];
  }

  async updatePassword(userId, hashedPassword) {
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL 
       WHERE id = $2`,
      [hashedPassword, userId]
    );
  }

  async getUserByResetCode(code) {
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 
         AND reset_password_expires > CURRENT_TIMESTAMP`,
      [code]
    );
    return result.rows[0];
  }

  // ✅ НОВИЙ МЕТОД
  async getSpecialistByUserId(userId) {
    const result = await pool.query(
      `SELECT id AS specialist_id FROM specialists WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] ?? null;
  }
}

export default new AuthRepository();