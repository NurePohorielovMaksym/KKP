import pool from '../../config/db.js';

class AppointmentRepository {
async create(data) {
  const { 
    user_id, 
    guest_name, 
    guest_phone,
    guest_email,
    specialist_id, 
    rehabilitation_type_id, 
    appointment_date, 
    appointment_time, 
    status = 'pending', 
    notes 
  } = data;

  const query = `
    INSERT INTO appointments 
      (user_id, guest_name, guest_phone, guest_email, specialist_id, rehabilitation_type_id, appointment_date, appointment_time, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [user_id, guest_name, guest_phone, guest_email, specialist_id, rehabilitation_type_id, appointment_date, appointment_time, status, notes];
  
  const res = await pool.query(query, values);
  return res.rows[0];
}

  async getAll() {
    const query = `
      SELECT * FROM appointments 
      ORDER BY appointment_date DESC, appointment_time DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  async getById(id) {
    const res = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    return res.rows[0];
  }

  async update(id, data) {
    const { status, appointment_date, appointment_time, notes } = data;
    
    const query = `
      UPDATE appointments
      SET 
        status = COALESCE($1, status),
        appointment_date = COALESCE($2, appointment_date),
        appointment_time = COALESCE($3, appointment_time),
        notes = COALESCE($4, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const res = await pool.query(query, [status, appointment_date, appointment_time, notes, id]);
    return res.rows[0];
  }

  async delete(id) {
    const res = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }

  async checkDoctorAvailability(specialistId, date, time) {
    const query = `
      SELECT id FROM appointments 
      WHERE specialist_id = $1 
        AND appointment_date = $2 
        AND appointment_time = $3 
        AND status != 'cancelled'
    `;
    const res = await pool.query(query, [specialistId, date, time]);
    return res.rows[0]; 
  }

  async getBookedTimesBySpecialistAndDate(specialistId, date) {
  const query = `
      SELECT appointment_time, status, confirmation_expires 
      FROM appointments
      WHERE specialist_id = $1
        AND appointment_date = $2
        AND (
          status = 'confirmed' 
          OR (status = 'pending' AND confirmation_expires > NOW())
        )
  `;
  const res = await pool.query(query, [specialistId, date]);
  return res.rows; 
}

async setConfirmationCode(id, code, expires) {
    await pool.query(
        `UPDATE appointments 
         SET confirmation_code = $1, confirmation_expires = $2 
         WHERE id = $3`,
        [code, expires, id]
    );
}

async getByIdWithCode(id) {
    const res = await pool.query(
        'SELECT * FROM appointments WHERE id = $1', [id]
    );
    return res.rows[0];
}

async updateStatus(id, status) {
  await pool.query(
    `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, id]
  );

  const result = await pool.query(
    `
      SELECT
        a.*,
        u.first_name,                    -- Беремо імена з таблиці users
        u.last_name,
        u.middle_name,
        s.specialization,                -- Спеціалізація та базова ціна залишаються у specialists
        s.price AS base_price,           
        rt.name AS service_name,         -- Назва конкретної послуги (може бути NULL)
        rt.price AS service_price,       -- Ціна конкретної послуги (може бути NULL)
        rt.duration_minutes              -- Тривалість послуги (може бути NULL)
      FROM appointments a
      JOIN specialists s ON a.specialist_id = s.id
      JOIN users u ON s.user_id = u.id   -- Зв'язуємо спеціаліста з його акаунтом користувача
      LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id
      WHERE a.id = $1
    `,
    [id]
  );

  return result.rows[0];
}

async hasCompletedAppointment(userId, specialistId) {
    const res = await pool.query(
        `SELECT id FROM appointments 
         WHERE user_id = $1 
           AND specialist_id = $2 
           AND status = 'completed'
         LIMIT 1`,
        [userId, specialistId]
    );
    return res.rows.length > 0;
}

async countTotalActive(userId, guestEmail) {
    const query = `
        SELECT COUNT(*) FROM appointments 
        WHERE (
            ($1::int IS NOT NULL AND user_id = $1)
            OR
            ($2::text IS NOT NULL AND guest_email = $2)
        )
        AND status IN ('pending', 'confirmed')`;
    const res = await pool.query(query, [userId ?? null, guestEmail ?? null]);
    return parseInt(res.rows[0].count);
}

async hasAppointmentWithDoctorOnDate(userId, guestEmail, specialistId, date) {
    const query = `
        SELECT COUNT(*) FROM appointments 
        WHERE (
            ($1::int IS NOT NULL AND user_id = $1)
            OR
            ($2::text IS NOT NULL AND guest_email = $2)
        )
        AND specialist_id = $3 
        AND appointment_date = $4
        AND status IN ('pending', 'confirmed')`;
    const res = await pool.query(query, [userId ?? null, guestEmail ?? null, specialistId, date]);
    return parseInt(res.rows[0].count) > 0;
}

async checkUserTimeConflict(userId, guestEmail, date, time) {
    const query = `
        SELECT COUNT(*) FROM appointments 
        WHERE (
            ($1::int IS NOT NULL AND user_id = $1)
            OR
            ($2::text IS NOT NULL AND guest_email = $2)
        )
        AND appointment_date = $3 
        AND appointment_time = $4
        AND status IN ('pending', 'confirmed')`;
    const res = await pool.query(query, [userId ?? null, guestEmail ?? null, date, time]);
    return parseInt(res.rows[0].count) > 0;
}

}

export default new AppointmentRepository();