import pool from '../../config/db.js';

class TimeSlotRepository {
  async createWeeklySchedule(specialistId, slots) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'DELETE FROM specialist_time_slots WHERE specialist_id = $1 AND day_of_week IS NOT NULL', 
        [specialistId]
      );

      const query = `
        INSERT INTO specialist_time_slots (specialist_id, day_of_week, start_time, end_time, is_available, slot_duration)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `;
      
      const results = [];
      for (const slot of slots) {
        const res = await client.query(query, [
          slot.specialist_id, 
          slot.day_of_week, 
          slot.start_time, 
          slot.end_time, 
          slot.is_available,
          slot.slot_duration
        ]);
        results.push(res.rows[0]);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getBySpecialistId(specialistId) {
    const query = `
      SELECT * FROM specialist_time_slots 
      WHERE specialist_id = $1 
      ORDER BY day_of_week, specific_date
    `;
    const result = await pool.query(query, [specialistId]);
    return result.rows;
  }

  async upsertSpecificDate(specialistId, data) {
    const { specific_date, start_time, end_time, is_available, reason, slot_duration } = data;
    const client = await pool.connect();
    
    try {
      const checkQuery = 'SELECT id FROM specialist_time_slots WHERE specialist_id = $1 AND specific_date = $2';
      const checkResult = await client.query(checkQuery, [specialistId, specific_date]);

      if (checkResult.rows.length > 0) {
        const updateQuery = `
          UPDATE specialist_time_slots
          SET start_time = $1, end_time = $2, is_available = $3, reason = $4, slot_duration = $5, updated_at = NOW()
          WHERE id = $6 RETURNING *
        `;
        const res = await client.query(updateQuery, [
          start_time , 
          end_time, 
          is_available, 
          reason,
          slot_duration || 60, 
          checkResult.rows[0].id
        ]);
        return { action: 'updated', record: res.rows[0] };
      } else {
        const insertQuery = `
          INSERT INTO specialist_time_slots (specialist_id, specific_date, start_time, end_time, is_available, reason, slot_duration)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const res = await client.query(insertQuery, [
          specialistId, specific_date, start_time, end_time, is_available, reason, slot_duration || 60
        ]);
        return { action: 'inserted', record: res.rows[0] };
      }
    } finally {
      client.release();
    }
  }

  async findActiveSlot(specialistId, date, dayOfWeek) {
  const query = `
    SELECT * FROM specialist_time_slots 
    WHERE specialist_id = $1 
      AND (specific_date = $2 OR (day_of_week = $3 AND specific_date IS NULL))
    ORDER BY specific_date DESC NULLS LAST
    LIMIT 1
  `;
  const res = await pool.query(query, [specialistId, date, dayOfWeek]);
  return res.rows[0];
  }

  async updateTemplateSlot(specialistId, dayOfWeek, data) {

  let {
    start_time,
    end_time,
    is_available,
    slot_duration
  } = data;

  if (!is_available) {
    start_time = '00:00:00';
    end_time = '00:00:00';
  }

  const query = `
    UPDATE specialist_time_slots
    SET
      start_time = $1,
      end_time = $2,
      is_available = $3,
      slot_duration = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE specialist_id = $5
      AND day_of_week = $6
      AND specific_date IS NULL
    RETURNING *;
  `;

  const values = [
    start_time,
    end_time,
    is_available,
    slot_duration,
    specialistId,
    dayOfWeek
  ];

  const res = await pool.query(query, values);

  return res.rows[0];
}
}

export default new TimeSlotRepository();