// server.js - основной сервер аутентификации
import express from 'express'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'
import pool, { initDB } from './database.js'

dotenv.config()

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Мидлвары
app.use(express.json())
app.use(express.static('public'))

// РЕГИСТРАЦИЯ - создание нового пользователя
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body
  
  // Проверяем, что email и пароль пришли
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' })
  }
  
  try {
    // Шифруем пароль
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Сохраняем в базу
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    )
    
    // Создаём JWT токен
    const token = jwt.sign(
      { userId: result.rows[0].id, email: result.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    res.json({ token, user: result.rows[0] })
  } catch (err) {
    // Ошибка при дубликате email
    if (err.code === '23505') {
      res.status(400).json({ error: 'Пользователь уже существует' })
    } else {
      res.status(500).json({ error: 'Ошибка сервера' })
    }
  }
})

// ВХОД - аутентификация пользователя
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  
  try {
    // Ищем пользователя в базе
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }
    
    const user = result.rows[0]
    
    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }
    
    // Создаём токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Запуск сервера
const start = async () => {
  await initDB()
  app.listen(process.env.PORT, () => {
    console.log(`🔐 Auth сервер запущен на http://localhost:${process.env.PORT}`)
  })
}

start()