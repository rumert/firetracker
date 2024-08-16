//database
import mongoose from 'mongoose';
import User from '../src/models/user.js';
import RefreshToken from '../src/models/refreshToken.js';
import connectDB from '../src/config/db.js';

//tools
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { expect } from 'chai';

//server
import { app } from '../src/servers/authServer.js';

describe('Integration tests', () => {

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    before(async () => {
        await connectDB()
        if (!mongoose.connection.db) {
            await new Promise((resolve) => {
                mongoose.connection.on('connected', resolve);
            });
        }
    });

    after(async () => {
        await mongoose.connection.close();
    });

    const testUser = {
        email: 'test@example.com',
        password: 'Password123'
    };

    describe("not requires a user", () => {

        it('should return 400 for no refreshToken', async () => {
            const tokenRes = await request(app)
                .get('/token')
                .expect(400)

            expect(tokenRes.body).not.to.have.property('accessToken');
        });

        it('should return 403 for a refreshToken not in db', async () => {

            const tokenRes = await request(app)
                .get('/token')
                .set('Authorization', `Bearer notInDatabase`)
                .expect(403)

            expect(tokenRes.body).not.to.have.property('accessToken');
        });

        it('should return 403 for an invalid token', async () => {

            const expires_at = new Date()
            const tokenInDb = await RefreshToken.create({
                user_id: 'test',
                token: 'tokenInDb',
                expires_at
            })
            expect(tokenInDb.token).to.equal('tokenInDb')

            const tokenRes = await request(app)
                .get('/token')
                .set('Authorization', 'Bearer tokenInDb')
                .expect(403)

            expect(tokenRes.body).not.to.have.property('accessToken');
        });

        it('should return error for invalid email', async () => {

            const loginRes = await request(app)
                .post('/login')
                .send({ email: 'invalid@@email.com', password: testUser.password })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400)
            expect(loginRes.body.error).to.equal('Invalid email');

            expect(loginRes.body).not.to.have.property('accessToken');
        });

        it('should return error for short password', async function () {
            this.timeout(5000)
            const loginRes = await request(app)
                .post('/login')
                .send({ email: testUser.email, password: '123' })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400)
            expect(loginRes.body.error).to.equal('Password must be between 6 and 20 characters');

            expect(loginRes.body).not.to.have.property('accessToken');
        });

    })

    describe("requires a user", () => {

        let res;

        beforeEach(async () => {
            res = await request(app)
            .post('/login')
            .send(testUser)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
        });

        it('should create a new user and return tokens on sign up', async () => {
        
            const user = await User.findOne({ email: testUser.email });
            expect(user.email).to.equal(testUser.email);
            expect(await bcrypt.compare(testUser.password, user.password_hash)).to.equal(true);

            const userFromAccessToken = jwt.verify(res.body.accessToken.token, process.env.ACCESS_TOKEN_SECRET);
            expect(userFromAccessToken.email).to.equal(user.email)
            expect(userFromAccessToken.uid).to.equal(user.id)

            const userFromRefreshToken = jwt.verify(res.body.refreshToken.token, process.env.REFRESH_TOKEN_SECRET);
            expect(userFromRefreshToken.email).to.equal(user.email)
            expect(userFromRefreshToken.uid).to.equal(user.id)
            const refreshToken = await RefreshToken.findOne({ token: res.body.refreshToken.token });
            expect(refreshToken?.token).to.equal(res.body.refreshToken.token);
        });

        it('should return tokens on successful login', async () => {

            const user = await User.findOne({ email: testUser.email });

            const loginRes = await request(app)
            .post('/login')
            .send(testUser)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)

            const userFromAccessToken = jwt.verify(loginRes.body.accessToken.token, process.env.ACCESS_TOKEN_SECRET);
            expect(userFromAccessToken.email).to.equal(user.email)
            expect(userFromAccessToken.uid).to.equal(user.id)

            const userFromRefreshToken = jwt.verify(loginRes.body.refreshToken.token, process.env.REFRESH_TOKEN_SECRET);
            expect(userFromRefreshToken.email).to.equal(user.email)
            expect(userFromRefreshToken.uid).to.equal(user.id)
            const refreshToken = await RefreshToken.findOne({ token: loginRes.body.refreshToken.token });
            expect(refreshToken?.token).to.equal(loginRes.body.refreshToken.token);
        });

        it('should return 403 with an error message on unsuccessful login', async () => {

            const user = await User.findOne({ email: testUser.email });
            expect(user.email).to.equal(testUser.email)
        
            const loginRes = await request(app)
            .post('/login')
            .send({
                email: "test@example.com",
                password: "WrongPass21"
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            expect(loginRes.status).to.equal(403)

            expect(loginRes.body.error).to.equal("Wrong password")
            expect(loginRes.body).not.have.property('accessToken')
            expect(loginRes.body).not.have.property('refreshToken')
        });

        it('should return an access token using a valid refresh token', async () => {

            const tokenRes = await request(app)
                .get('/token')
                .set('Authorization', `Bearer ${res.body.refreshToken.token}`)
                .expect(200)

            expect(tokenRes.body.accessToken).to.have.property('token');
        });
        
    })

})

