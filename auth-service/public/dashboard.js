// dashboard.js - работа с профилем через Profile Service

const token = localStorage.getItem('token')
const user = JSON.parse(localStorage.getItem('user') || '{}')

// Проверка токена
if (!token) {
    window.location.href = '/'
}

// Показываем информацию о пользователе
document.getElementById('userInfo').innerHTML = `
    <p>Вы вошли как: ${user.email}</p>
`

// URL Profile сервиса
const PROFILE_API = 'http://localhost:3001/api/profile'

// Создание или обновление профиля
async function createOrUpdateProfile() {
    const fullName = document.getElementById('fullName').value
    const bio = document.getElementById('bio').value
    
    const response = await fetch(PROFILE_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, bio })
    })
    
    if (response.ok) {
        const profile = await response.json()
        displayProfile(profile)
        alert('Профиль сохранён!')
    } else {
        const error = await response.json()
        alert('Ошибка: ' + error.error)
    }
}

// Получение и отображение профиля
async function loadProfile() {
    const response = await fetch(PROFILE_API, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (response.ok) {
        const profile = await response.json()
        displayProfile(profile)
        // Заполняем поля формы
        document.getElementById('fullName').value = profile.fullName || ''
        document.getElementById('bio').value = profile.bio || ''
    }
}

// Отображение профиля на странице
function displayProfile(profile) {
    const profileDiv = document.getElementById('profileDisplay')
    if (profile.fullName || profile.bio) {
        profileDiv.innerHTML = `
            <h3>Ваш профиль</h3>
            <p><strong>Имя:</strong> ${profile.fullName || 'Не указано'}</p>
            <p><strong>О себе:</strong> ${profile.bio || 'Не указано'}</p>
        `
    } else {
        profileDiv.innerHTML = '<p>Профиль ещё не заполнен</p>'
    }
}

// Выход из системы
function logout() {
    localStorage.clear()
    window.location.href = '/'
}

// Загружаем профиль при старте
loadProfile()