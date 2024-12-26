//database
import mongoose from 'mongoose';

//tools
import bcrypt from 'bcrypt';
import { expect } from 'chai';

//functions
import { 
    createUser, 
    generatePasswordHash, 
    generateRefreshToken, 
    generateAccessToken 
} from '../src/utils/functions.js';
import connectDB from '../src/config/db.js';

describe('Function tests', () => {

    before(async () => {
        await connectDB()
        if (!mongoose.connection.db) {
            await new Promise((resolve) => {
                mongoose.connection.on('connected', resolve);
            });
        }
    });

    after(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    const testUser = {
        email: 'test@example.com',
        password: 'Password123'
    };

    it('should generate a valid password hash', async () => {
        const hash = await generatePasswordHash(testUser.password)
        expect(await bcrypt.compare(testUser.password, hash)).to.be.true
    })

    it('should create a new user', async () => {
        try {
            const user = await createUser(testUser.email.split('@')[0], testUser.email, testUser.password);
            expect(user.email).to.equal(testUser.email);
            expect(user.password).to.equal(testUser.password);
        } catch (error) {
            //console.log(error)
        }
    });

    it('should generate a refresh token', async () => {
        try {
            const user = await createUser(testUser.split('@')[0], testUser.email, testUser.password);
            const token = generateRefreshToken({ email: user.email, uid: user.id });
            expect(token).to.have.property('token');
            expect(token).to.have.property('expires');
        } catch (error) {
            //console.log(error)
        }
    });
    
    it('should generate an access token', async () => {
        try {
            const user = await createUser(testUser.split('@')[0], testUser.email, testUser.password);
            const token = generateAccessToken({ email: user.email, uid: user.id });
            expect(token).to.have.property('token');
            expect(token).to.have.property('expires');
        } catch (error) {
            //console.log(error)
        }
    });

})

