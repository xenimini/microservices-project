// database.js - подключение к PostgreSQL для профилей
import pg from 'pg'
const { Pool } = pg

// Настройка подключения
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// Создание таблицы profiles
export async function initDB() {
  const query = `
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      full_name VARCHAR(255),
      bio TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  await pool.query(query)
  console.log('✅ Таблица profiles готова')
}

export default pool