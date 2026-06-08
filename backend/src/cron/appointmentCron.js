import cron from 'node-cron';
import pool from '../config/db.js';

const DELAY_MINUTES = 70; 

const markCompletedAppointments = async () => {
  try {
    const result = await pool.query(
      `
      UPDATE appointments
      SET status = 'completed', updated_at = NOW()
      WHERE status = 'confirmed'
        AND (
          appointment_date < CURRENT_DATE
          OR (
            appointment_date = CURRENT_DATE
            AND appointment_time < CURRENT_TIME - INTERVAL '${DELAY_MINUTES} minutes'
          )
        )
      RETURNING id
      `
    );

    if (result.rows.length > 0) {
      console.log(`[CRON] Оновлено ${result.rows.length} записів -> completed`);
    }
  } catch (err) {
    console.error('[CRON] Помилка оновлення статусів:', err.message);
  }
};

cron.schedule('*/30 * * * *', markCompletedAppointments);

console.log('[CRON] Планувальник запущено');
