const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const jwt = require('jsonwebtoken')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'useronename',
    email: 'userone@email.com',
    password: 'useronepass',
    tokens: [{
        token: jwt.sign({ _id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach(async ()=>{
    await User.deleteMany()
    await new User(userOne).save()
})

test('should create a user', async () => {
    const response = await request(app).post('/users').send({
        name: 'usertwo',
        email: 'usertwo@gmail.com',
        password: 'usertwopass'
    }).expect(201)

    const user = await User.findById( response.body.savedUser._id)
    expect(user).not.toBeNull()
    expect(user.password).not.toBe('usertwopass')
    expect(user).toMatchObject({
          name: 'usertwo',
          email: 'usertwo@gmail.com'
    })
    expect(user.tokens[0].token).toBe(response.body.savedUser.tokens[0].token)
})


test('should login as userOne', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('should not login with wrong user password', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'wrongpassword'
    }).expect(400)
})

test('should not login with nonexixting user', async () => {
    await request(app).post('/users/login').send({
        email: 'nonexisting@email.com',
        password: userOne.password
    }).expect(400)
})

test('should get user profile of a user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)      // set is user to set headers
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('should delete user when it is authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('should not delete user when it\'s not authenticated', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})