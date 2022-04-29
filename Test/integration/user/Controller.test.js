const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('UC-101 Inlog functionality testing GET /api/auth/login', (done) => {
    describe('UC-101 Login failing', () => {
        it('TC-101-2 When does not have the right email, it will return a error message: User not found', (done) => {
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

        it('TC-101-3 When the user does not have the right password, it will say that the password is incorrect', (done) => {
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

        it('TC-101-1 Checks if empty email field, gives a error message', (done) => {
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

        it('TC-101-1 Checks if empty password field, gives a error message', (done) => {
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
        it('TC-101-5 Checks if correct inlog data will give back a user', (done) => {
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

describe('UC-303 get all meals GET /api/meal/', (done) => {
    it('TC-303 get list of users', (done) => {
        chai.request(server)
        .get('/api/meal').send()
        .end((req, res) => {
            res.should.be.a('object');
            let {status, result} = res.body;
            status.should.be.equals(200);
            done();
        })
    })
})

//describe('UC-304 get meal details.', (done) =>{});
//describe('UC-305 delete meal test',(done) =>{});
//describe('UC-401 sign on participation, (done) =>{});
//describe('UC-402 sign off participation, (done) =>{});
//describe('UC-403 get all participants of that meal, (done) =>{});
//describe('UC-404 get detail of the participant at that meal, (done) =>{});
//Testcases UC-401 to UC-404