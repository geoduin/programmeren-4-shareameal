const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('UC-101 Inlog functionality testing GET /api/auth/login', (done) => {
    beforeEach((done) => {
        done();
    });

    describe('UC-101 Login failing', () => {
        it('When does not have the right email, it will return a error message: User not found', (done) => {
            chai.request(server).get('/api/auth/login').send({
                email: "ArezoM@outlook.com",
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('User not found');
                done();
            })
        })

        it('When the user does not have the right password, it will say that the password is incorrect', (done) => {
            chai.request(server).get('/api/auth/login').send({
                email: "BrieThom@outlook.com",
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('Password is incorrect');
                done();
            })
        })

        it('Checks if empty email field, gives a error message', (done) => {
            chai.request(server).get('/api/auth/login').send({
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('Email must be a string input');
                done();
            })
        })

        it('Checks if empty password field, gives a error message', (done) => {
            chai.request(server).get('/api/auth/login').send({
                email: "BrieThom@outlook.com"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('Password must be a string');
                done();
            })
        })
    })

    describe('UC-101 Correct login', () => {
        it('Checks if correct inlog data will give back a user', (done) => {
            chai.request(server).get('/api/auth/login').send({
                email: "BrieThom@outlook.com",
                password: "NoPassword789"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(200);
                console.log(result);
                assert.deepEqual(result, {
                    id: 2,
                    firstName: 'Brian',
                    lastName: 'Thomson',
                    city: 'Rotterdam',
                    street: 'Beurs',
                    email: 'BrieThom@outlook.com',
                    password: 'NoPassword789',
                    isActive: true,
                    phoneNumber: '06 12425475',
                    token: 'YouHaveAccessToken'
                  }, 'Result is completed');
                done();
            })
        })
    })
})

describe('UC-201 Manage movies POST /api/user', (done) => {
    describe('UC-201 Add movies', () => {
        beforeEach((done) => {
            database = [];
            done();
        });

        it('TC-201-1 When required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('Title must be a string');
                done();
            })
        })

        it('TC-201-1 When lastName is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                firstName: "Matias",
                city: "Montevideo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('LastName must be a string');
                done();
            })
        })
        it('TC-201-1 When city is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                firstName: "Matias",
                lastName: "Arezo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('City must be a string');
                done();
            })
        })

        it('TC-201-1 When street is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                email: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('Street must be a string');
                done();
            })
        })

        it('TC-201-1 When email is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('email must be a string');
                done();
            })
        })
        it('TC-201-1 When password is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('password must be a string');
                done();
            })
        })
        it('TC-201-1 When isActive is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                password: "qweqweqweq",
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('isActive must be a boolean');
                done();
            })
        })
        it('TC-201-1 When phoneNumber is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                password: "qweqweqweq",
                isActive: true,
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('phoneNumber must be a string');
                done();
            })
        })

        //Fixes need to be made
        it('TC-201-3 tot -5 When email has already been registered, it will return a error message and does not persist within the database', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "Wessel@outlook.com",
                password: "qweqweqweq",
                isActive: true,
                phoneNumber:"087890322"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(406);
                result.should.be.a('string').that.equals('Email has been taken');
                done();
            })
        })

        it('TC-201-5 Successful registration', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "Aroujo@outlook.com",
                password: "qweqweqweq",
                isActive: true,
                phoneNumber:"087890322"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result, user} = res.body;
                status.should.be.equals(201);
                result.should.be.a('string').that.equals('User has been registered.');
                //Token test will be tested in the future
                assert.deepEqual(user, {
                    id: 3,
                    firstName: "Matias",
                    lastName: "Arezo",
                    city: "Montevideo",
                    street: "Straat",
                    email: "Aroujo@outlook.com",
                    password: "qweqweqweq",
                    isActive: true,
                    phoneNumber:"087890322"
                })
                done();
            })
        })
        //it('TC-201 When a required inut is missing, a valid error should be'){}
    })
});

//Testcases UC-202 to UC-206 need to be made
describe('UC-202 Get all users Get /api/user', (done) => {
    it('TC-202-1 Empty list', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
    it('TC-202-2 show two users', (done)=>{
        chai.request(server).get('/api/user').send({

        }).end((req, res)=>{
            done();
        })
    })
    it('TC-202-4 show users with active=false', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })

    it('TC-202-5 show users with active=true', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
    it('TC-202-6 show users based on searchTerm', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
});

describe('UC-203 Token /api/user/profile', (done) => {
    it('TC-203-1 Invalid token', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
    it('TC-203-2 valid token and existing users', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
});

describe('UC-204 User details checker', (done) => {
    it('TC-204-2 Invalid token', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
    it('TC-204-1 User does not exist', (done)=>{
        chai.request(server).delete('/api/user').send({
            
        }).end((req, res)=>{
            done();
        })
    })
});

//Testcases UC-301 to UC-305

//Testcases UC-401 to UC-404