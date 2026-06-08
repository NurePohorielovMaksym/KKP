import pool from "../../config/db.js";

class UserRepository{ 

    async findUsers() {
        const query = `
        SELECT id, email, first_name, last_name, middle_name, phone, role
        FROM users;
        `;
        const result = await pool.query(query)
        return result.rows;
    }

    async findUserById(id) {
        const query = `
        Select id, email, first_name, last_name, middle_name, phone, role
        FROM users
        WHERE id = $1;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async update(id, data) {
    const { 
      first_name, last_name, middle_name, phone, date_of_birth, 
      font_size, high_contrast, high_contrast_mode, text_to_speech 
    } = data;

    const query = `
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        middle_name = COALESCE($3, middle_name),
        phone = COALESCE($4, phone),
        date_of_birth = COALESCE($5, date_of_birth),
        font_size = COALESCE($6, font_size),
        high_contrast = COALESCE($7, high_contrast),
        high_contrast_mode = COALESCE($8, high_contrast_mode),
        text_to_speech = COALESCE($9, text_to_speech),
        updated_at = NOW()
      WHERE id = $10
      -- Повертаємо всі поля, окрім пароля, з міркувань безпеки
      RETURNING id, email, first_name, last_name, middle_name, phone, date_of_birth, role, font_size, high_contrast, high_contrast_mode, text_to_speech, created_at, updated_at
    `;
    
    const values = [
      first_name, last_name, middle_name, phone, date_of_birth, 
      font_size, high_contrast, high_contrast_mode, text_to_speech, id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id, email, role';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    }
}

export default new UserRepository();