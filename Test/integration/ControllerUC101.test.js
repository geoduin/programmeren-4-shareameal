process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const tokens = require('../../src/tokens/UserTokens.token');

chai.should();
chai.use(chaiHttp);

describe('UC-101 Inlog functionality testing GET /api/auth/login', (done) => {
    describe('UC-101 Login failing', () => {
        it('TC-101-1.1 Checks if empty email field, gives a error message', (done) => {
            chai.request(server).post('/api/auth/login').send({
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('Email must be a string input');
                done();
            })
        })

        it('TC-101-1.2 Checks if empty password field, gives a error message', (done) => {
            chai.request(server).post('/api/auth/login').send({
                emailAdress: "BrieThom@outlook.com"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                message.should.be.a('string').that.equals("Password must be a string");
                status.should.be.equals(400);
                done();
            })
        })

        it('TC-101-2 invalid email', (done) => {
            chai.request(server).post('/api/auth/login').send({
                emailAdress: "ss",
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                message.should.be.a('string').that.equals('Email has the wrong format');
                status.should.be.equals(400);
                done();
            })
        })

        it('TC-101-3 When the user does not have the right password, it will say that the password is incorrect', (done) => {
            chai.request(server).post('/api/auth/login').send({
                emailAdress: "h.huizinga@server.nl",
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('Not the right password of this email');
                done();
            })
        })

        it('TC-101-4 When user does not have the right emailAdress, it will return a error message: User not found', (done) => {
            chai.request(server).post('/api/auth/login').send({
                emailAdress: "ArezoaaasdM@outlook.com",
                password: "MontevideoFC"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(404);
                message.should.be.a('string').that.equals("User does not exist");
                done();
            })
        })
    })

    describe('UC-101 Correct login', () => {
        it('TC-101-5 Checks if correct inlog data will give back a user', (done) => {
            chai.request(server).post('/api/auth/login').send({
                emailAdress: "h.huizinga@server.nl",
                password: "secret"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(200);
                assert.deepEqual(result, {
                    id: 3,
                    firstName: "Herman",
                    lastName: "Huizinga",
                    isActive: true,
                    emailAdress: "h.huizinga@server.nl",
                    phoneNumber: "06-12345678",
                    roles: ["editor","guest"],
                    street: "",
                    city: "",
                    token: result.token
                });
                done();
            })
        })
    })
})



