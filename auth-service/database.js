// database.js - подключение к PostgreSQL и создание таблицы users
import pg from 'pg'
const { Pool } = pg

// Настройка подключения к БД
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// Функция для создания таблицы users
export async function initDB() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  await pool.query(query)
  console.log('✅ Таблица users готова')
}

export default pool