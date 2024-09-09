//tools
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { expect } from 'chai';

//server
const authServerUrl = "http://localhost:5000";
const mainServerUrl = "http://localhost:4000";

describe('Integration tests', () => {

    beforeEach(async () => {
        await request(mainServerUrl)
        .get('/test/db/reset')
        .expect(200)
    });

    const testUser = {
        email: 'test@example.com',
        password: 'Password123'
    };

    describe("not requires a user", () => {

        it('should return 400 for no refreshToken', async () => {
            const tokenRes = await request(authServerUrl)
                .get('/token')
                .expect(400)

            expect(tokenRes.body).not.to.have.property('accessToken');
        });

        it('should return 403 for a refreshToken not in db', async () => {

            const tokenRes = await request(authServerUrl)
                .get('/token')
                .set('Authorization', `Bearer notInDatabase`)
                .expect(403)

            expect(tokenRes.body).not.to.have.property('accessToken');
        });

        it('should return error for invalid email', async () => {

            const loginRes = await request(authServerUrl)
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
            const loginRes = await request(authServerUrl)
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
            res = await request(authServerUrl)
            .post('/login')
            .send(testUser)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
        });

        it('should create a new user and return tokens on sign up', async () => {

            const userFromAccessToken = jwt.verify(res.body.accessToken.token, process.env.ACCESS_TOKEN_SECRET);
            expect(userFromAccessToken.email).to.exist
            expect(userFromAccessToken.uid).to.exist

            const userFromRefreshToken = jwt.verify(res.body.refreshToken.token, process.env.REFRESH_TOKEN_SECRET);
            expect(userFromRefreshToken.email).to.exist
            expect(userFromRefreshToken.uid).to.exist
        });

        it('should return tokens on successful login', async () => {

            const loginRes = await request(authServerUrl)
            .post('/login')
            .send(testUser)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)

            const userFromAccessToken = jwt.verify(loginRes.body.accessToken.token, process.env.ACCESS_TOKEN_SECRET);
            expect(userFromAccessToken.email).to.exist
            expect(userFromAccessToken.uid).to.exist

            const userFromRefreshToken = jwt.verify(loginRes.body.refreshToken.token, process.env.REFRESH_TOKEN_SECRET);
            expect(userFromRefreshToken.email).to.exist
            expect(userFromRefreshToken.uid).to.exist
        });

        it('should return 403 with an error message on unsuccessful login', async () => {

            expect(testUser.email).to.exist
        
            const loginRes = await request(authServerUrl)
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

            const tokenRes = await request(authServerUrl)
                .get('/token')
                .set('Authorization', `Bearer ${res.body.refreshToken.token}`)
                .expect(200)

            expect(tokenRes.body.accessToken).to.have.property('token');
        });
        
    })

})

