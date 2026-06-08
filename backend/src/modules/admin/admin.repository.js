import pool from '../../config/db.js';

class AdminRepository {

 async getDashboardStats() {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'patient') AS total_patients,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') AS total_doctors,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
        (SELECT COUNT(*) FROM specialists WHERE is_active = true) AS active_specialists,
        (SELECT COUNT(*) FROM appointments) AS total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed') AS confirmed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') AS pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'cancelled') AS cancelled_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'completed') AS completed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURRENT_DATE) AS today_appointments,
        
        -- Загальний дохід (виправлено)
        (SELECT COALESCE(SUM(COALESCE(rt.price, s.price)), 0)::int 
         FROM appointments a 
         JOIN specialists s ON a.specialist_id = s.id 
         LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id 
         WHERE a.status = 'completed') AS total_revenue,
        
        -- Дохід за поточний місяць (виправлено)
        (SELECT COALESCE(SUM(COALESCE(rt.price, s.price)), 0)::int 
         FROM appointments a 
         JOIN specialists s ON a.specialist_id = s.id 
         LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id 
         WHERE a.status = 'completed' 
         AND DATE_TRUNC('month', a.appointment_date) = DATE_TRUNC('month', CURRENT_DATE)) AS monthly_revenue,
        
        -- Дохід за сьогодні (виправлено)
        (SELECT COALESCE(SUM(COALESCE(rt.price, s.price)), 0)::int 
         FROM appointments a 
         JOIN specialists s ON a.specialist_id = s.id 
         LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id 
         WHERE a.status = 'completed' 
         AND a.appointment_date = CURRENT_DATE) AS today_revenue
    `);
    return result.rows[0];
}

  async getAppointmentsPerMonth() {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', appointment_date), 'YYYY-MM') AS month,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM appointments
      WHERE appointment_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', appointment_date)
      ORDER BY month ASC
    `);
    return result.rows;
  }

  async getTopSpecialists(limit = 5) {
    const result = await pool.query(`
      SELECT 
        s.id,
        u.first_name,
        u.last_name,
        s.specialization,
        COUNT(a.id)::int AS appointments_count,
        COALESCE(SUM(COALESCE(rt.price, s.price)), 0)::int AS revenue
      FROM specialists s
      JOIN users u ON s.user_id = u.id
      JOIN appointments a ON s.id = a.specialist_id 
      LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id
      WHERE a.status IN ('completed')
      GROUP BY s.id, u.first_name, u.last_name, s.specialization
      ORDER BY revenue DESC, appointments_count DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  async getRecentAppointments(limit = 20) {
    const result = await pool.query(`
      SELECT
        a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
        a.guest_name, a.guest_phone, a.guest_email,
        u.first_name AS patient_first_name, u.last_name AS patient_last_name, u.email AS patient_email, u.phone AS patient_phone,
        su.first_name AS doctor_first_name, su.last_name AS doctor_last_name, su.middle_name AS doctor_middle_name,
        s.specialization, s.price
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN specialists s ON a.specialist_id = s.id
      LEFT JOIN users su ON s.user_id = su.id
      ORDER BY a.id DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  async getAllAppointments({ page = 1, limit = 20, status, doctor, date_from, date_to, search, price_min, price_max, sort }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    const priceCalculated = `(
      CASE 
        WHEN rt.name = 'Консультація' OR a.rehabilitation_type_id IS NULL 
        THEN s.price 
        ELSE rt.price 
      END
    )::int`;
    
    if (status) { conditions.push(`a.status = $${idx++}`); values.push(status); }
    if (doctor) { conditions.push(`a.specialist_id = $${idx++}`); values.push(doctor); }
    if (date_from) { conditions.push(`a.appointment_date >= $${idx++}`); values.push(date_from); }
    if (date_to)   { conditions.push(`a.appointment_date <= $${idx++}`); values.push(date_to); }
    
    if (price_min) { conditions.push(`${priceCalculated} >= $${idx++}`); values.push(Number(price_min)); }
    if (price_max) { conditions.push(`${priceCalculated} <= $${idx++}`); values.push(Number(price_max)); }
    
    if (search) {
      conditions.push(`(a.guest_name ILIKE $${idx} OR a.guest_email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR su.first_name ILIKE $${idx} OR su.last_name ILIKE $${idx} OR rt.name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap = {
      date_desc:  'a.appointment_date DESC, a.id DESC',
      date_asc:   'a.appointment_date ASC,  a.id ASC',
      price_desc: `${priceCalculated} DESC NULLS LAST`,
      price_asc:  `${priceCalculated} ASC NULLS LAST`,
    };
    const orderBy = orderMap[sort] || 'a.id DESC';

    const dataResult = await pool.query(`
      SELECT
        a.id, a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
        a.guest_name, a.guest_phone, a.guest_email,
        u.first_name AS patient_first_name, u.last_name AS patient_last_name, u.email AS patient_email, u.phone AS patient_phone,
        su.first_name AS doctor_first_name, su.last_name AS doctor_last_name, su.middle_name AS doctor_middle_name,
        s.specialization,
        rt.name AS service_name,
        ${priceCalculated} AS price
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN specialists s ON a.specialist_id = s.id
      LEFT JOIN users su ON s.user_id = su.id
      LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...values, limit, offset]);

    const countResult = await pool.query(`
      SELECT COUNT(*) 
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN specialists s ON a.specialist_id = s.id
      LEFT JOIN users su ON s.user_id = su.id
      LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id
      ${where}
    `, values);

    const total = parseInt(countResult.rows[0].count);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
}

  // Додайте sort до параметрів функції
async getAllUsers({ page = 1, limit = 20, role, search, date_from, date_to, sort }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (role) { conditions.push(`role = $${idx++}`); values.push(role); }
  if (search) {
    conditions.push(`(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (date_from) { conditions.push(`created_at >= $${idx++}`); values.push(date_from); }
  if (date_to)   { conditions.push(`created_at <= ($${idx++}::date + INTERVAL '1 day')`); values.push(date_to); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const orderMap = {
    newest: 'id DESC',
    oldest: 'id ASC',
    name_asc: 'first_name ASC NULLS LAST',
    name_desc: 'first_name DESC NULLS LAST',
  };
  
  const orderBy = orderMap[sort] || 'id DESC';

  const dataResult = await pool.query(`
    SELECT id, email, first_name, last_name, middle_name, phone, role, created_at, updated_at
    FROM users
    ${where}
    ORDER BY ${orderBy}
    LIMIT $${idx} OFFSET $${idx + 1}
  `, [...values, limit, offset]);

  const countResult = await pool.query(`SELECT COUNT(*) FROM users ${where}`, values);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
}

  async getUserById(id) {
    const userResult = await pool.query(`
      SELECT id, email, first_name, last_name, middle_name, phone, role, created_at, updated_at
      FROM users WHERE id = $1
    `, [id]);

    const user = userResult.rows[0];
    if (!user) return null;

    const appointmentsResult = await pool.query(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.status,
             su.first_name AS doctor_first_name, su.last_name AS doctor_last_name,
             s.specialization, s.price
      FROM appointments a
      LEFT JOIN specialists s ON a.specialist_id = s.id
      LEFT JOIN users su ON s.user_id = su.id
      WHERE a.user_id = $1
      ORDER BY a.appointment_date DESC
      LIMIT 10
    `, [id]);

    return { ...user, recent_appointments: appointmentsResult.rows };
  }

  async deleteUser(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email, role', [id]);
    return result.rows[0];
  }

  async updateUserRole(id, role) {
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role`,
      [role, id]
    );
    return result.rows[0];
  }

  async getAllSpecialists() {
    const result = await pool.query(`
      SELECT
        s.id AS specialist_id, s.specialization, s.qualification, s.years_of_experience,
        s.bio, s.photo_url, s.is_active, s.price, s.created_at,
        u.id AS user_id, u.first_name, u.last_name, u.middle_name, u.email, u.phone,
        COUNT(a.id) AS total_appointments,
        COUNT(a.id) FILTER (WHERE a.status = 'confirmed') AS confirmed_appointments,
        COALESCE(SUM(CASE WHEN rt.name = 'Консультація' OR a.rehabilitation_type_id IS NULL THEN s.price ELSE rt.price END) FILTER (WHERE a.status = 'confirmed'), 0) AS revenue
      FROM specialists s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN appointments a ON a.specialist_id = s.id
      LEFT JOIN rehabilitation_types rt ON a.rehabilitation_type_id = rt.id
      LEFT JOIN specialists s2 ON s2.id = a.specialist_id
      GROUP BY s.id, u.id
      ORDER BY s.created_at DESC
    `);
    return result.rows;
  }

  async toggleSpecialistActive(specialistId, isActive) {
    const result = await pool.query(
      `UPDATE specialists SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isActive, specialistId]
    );
    return result.rows[0];
  }

  async deleteAppointment(id) {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  async updateAppointmentStatus(id, status) {
    const result = await pool.query(
      `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }

  async getNewUsersPerMonth() {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE role = 'patient') AS patients,
        COUNT(*) FILTER (WHERE role = 'doctor') AS doctors
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `);
    return result.rows;
  }
}

export default new AdminRepository();