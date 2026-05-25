// server.js - сервер профилей на Fastify
import Fastify from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import pool, { initDB } from './database.js'
import { verifyJWT } from './auth.js'

dotenv.config()

const fastify = Fastify({ logger: true })

// Настройка CORS - разрешаем запросы с Auth сервера
await fastify.register(cors, {
  origin: 'http://localhost:3000', // только с Auth сервиса
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})

// ПОЛУЧИТЬ профиль
fastify.get('/api/profile', { preHandler: verifyJWT }, async (request, reply) => {
  const userId = request.user.userId
  
  const result = await pool.query(
    'SELECT user_id, full_name, bio FROM profiles WHERE user_id = $1',
    [userId]
  )
  
  if (result.rows.length === 0) {
    return { user_id: userId, fullName: '', bio: '' }
  }
  
  const profile = result.rows[0]
  return {
    user_id: profile.user_id,
    fullName: profile.full_name,
    bio: profile.bio
  }
})

// СОЗДАТЬ или ОБНОВИТЬ профиль
fastify.post('/api/profile', { preHandler: verifyJWT }, async (request, reply) => {
  const userId = request.user.userId
  const { fullName, bio } = request.body
  
  // UPSERT - если есть, обновляем, если нет - создаём
  const query = `
    INSERT INTO profiles (user_id, full_name, bio, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET full_name = $2, bio = $3, updated_at = NOW()
    RETURNING user_id, full_name, bio
  `
  
  const result = await pool.query(query, [userId, fullName || null, bio || null])
  const profile = result.rows[0]
  
  return {
    user_id: profile.user_id,
    fullName: profile.full_name,
    bio: profile.bio
  }
})

// Запуск сервера
const start = async () => {
  await initDB()
  
  try {
    await fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
    console.log(`📝 Profile сервер запущен на http://localhost:${process.env.PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()