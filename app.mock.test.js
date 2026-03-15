const createApp = require('./app')
const request = require('supertest')
const validateUsername = require('./validation/validateUsername')
const validatePassword = require('./validation/validatePassword')

jest.mock('./validation/validateEmail', () => {
    return jest.fn((email) => {
        if (!email || typeof email !== 'string') return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return re.test(email);
    })
})

const validateEmail = require('./validation/validateEmail')
const app = createApp(validateUsername, validatePassword, validateEmail)

describe('given correct username and password', () => {
    test('return status 200', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.statusCode).toBe(200)
    })

    test('returns userId', async () => {
        const response = await request(app).post('/users').send({
            username: 'Username',
            password: 'Password123',
            email: 'student@example.com'
        })
        expect(response.body.userId).toBeDefined()
    })
})

describe('given incorrect or missing username and password', () => {
    test('return status 400 for invalid fields', async () => {
        const response = await request(app).post('/users').send({
            username: 'user',
            password: 'password',
            email: 'not-an-email'
        })
        expect(response.statusCode).toBe(400)
    })

    test('does not contain userId when fails', async () => {
        const response = await request(app).post('/users').send({
            username: 'user',
            password: 'password',
            email: 'not-an-email'
        })
        expect(response.body.userId).toBeUndefined()
    })

    test('return status 400 for missing fields', async () => {
        const response = await request(app).post('/users').send({})
        expect(response.statusCode).toBe(400)
    })
})