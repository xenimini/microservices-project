// script.js - обработка регистрации и входа

// Функция регистрации
async function register() {
    const email = document.getElementById('regEmail').value
    const password = document.getElementById('regPassword').value
    
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (response.ok) {
        // Сохраняем токен и переходим на дашборд
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/dashboard.html'
    } else {
        showMessage(data.error, 'error')
    }
}

// Функция входа
async function login() {
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/dashboard.html'
    } else {
        showMessage(data.error, 'error')
    }
}

// Показ сообщений
function showMessage(msg, type) {
    const msgDiv = document.getElementById('message')
    msgDiv.textContent = msg
    msgDiv.className = type
    setTimeout(() => msgDiv.textContent = '', 3000)
}