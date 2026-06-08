import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
console.log("ПЕРЕВІРКА URL:", process.env.DATABASE_URL);
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('✅ Підключено до бази даних PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Помилка підключення до бази:', err.message);
});

export default pool;