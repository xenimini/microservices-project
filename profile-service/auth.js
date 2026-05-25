// auth.js - проверка JWT токена
import jwt from 'jsonwebtoken'

// Функция для проверки токена в запросах
export async function verifyJWT(request, reply) {
  try {
    // Берём токен из заголовка Authorization
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Токен не предоставлен' })
    }
    
    const token = authHeader.split(' ')[1]
    
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Добавляем информацию о пользователе в запрос
    request.user = decoded
    
    return
  } catch (err) {
    return reply.code(401).send({ error: 'Неверный токен' })
  }
}