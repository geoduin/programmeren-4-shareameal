process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const DB = require('../../src/data/dbConnection')

describe('UC-401 sign on participation', (done) => {
    before((done) => {
        DB.getConnection((err, connecting)=>{
            if(err){ throw err};
            connecting.query('INSERT INTO user VALUES(6, "Xino", "Wong", 1, "Xino@gmail.com", "Secrid", "0612345678", "editor,guest", "China", "Harbin");',(err, results)=>{
                connecting.release();
            })
        })
        done();
    })

    it.skip('TC-401-1 Not logged in system', (done) => {
        chai.request(server)
            .post('/api/user/6/meal/2/signup')
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.result.should.be.equal('Token is invalid, you cannot sign up.')
                done();
            })
    })

    it('TC-401-2 Meal does not exist', (done) => {
        chai.request(server)
            .post('/api/user/6/meal/99999/signup')
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.result.should.be.equal('Meal does not exist!')
                done();
            })
    })

    it('TC-401-3 Successfully particpated in meal', (done) => {
        chai.request(server)
            .post('/api/user/6/meal/2/signup')
            .end((err, res) => {
                let aa = res.body;
                res.body.status.should.be.equal(200);
                res.body.currentlyParticipating.should.be.equal(true);
                done();
            })
    })
});
describe('UC-402 sign off participation', (done) => {
    it.skip('TC-402-1 Not logged in system', (done) => {
        chai.request(server)
            .put('/api/user/6/meal/2/signOff')
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.result.should.be.equal('Token is invalid, you cannot sign up.')
                done();
            })
    })

    it('TC-402-2 meal does not exist', (done) => {
        chai.request(server)
            .put('/api/user/6/meal/100000/signOff')
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.result.should.be.equal('Meal does not exist!')
                done();
            })
    })

    it('TC-402-3 sign up does not exist', (done) => {
        let userId = 99;
        let mealId = 2;
        chai.request(server)
            .put('/api/user/' + userId + '/meal/' + mealId + '/signOff')
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.result.should.be.equal(`Participant with userID: ${userId}, does not exist in meal with mealID: ${mealId}.`)
                done();
            })
    })

    it('TC-402-4 Succesfully signed off participation from a meal', (done) => {
        let userId = 6;
        let mealId = 2;
        chai.request(server)
            .put('/api/user/' + userId + '/meal/' + mealId + '/signOff')
            .end((err, res) => {
                res.body.status.should.be.equal(200);
                res.body.result.should.be.equal(`Participation of USERID => ${userId} with MEALID => ${mealId} has been removed.`);
                res.body.currentlyParticipating.should.be.equal(false);
                done();
            })
    })
});
describe('UC-403 get all participants of that meal', (done) => {
    it.skip('TC-403-1 Not logged in system', (done) => {
        chai.request(server)
            .get('/api/meal/1/participants')
            .send({ id: 1 })
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.result.should.be.equal('Token is invalid, you cannot sign up.')
                done();
            })
    })

    it('TC-403-2 participant does not exist in meal', (done) => {
        chai.request(server)
            .get('/api/meal/8567/participants')
            .send({ id: 1 })
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.result.should.be.equal('Meal does not exist!')
                done();
            })
    })

    it('TC-403-3 get list of participants', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants')
            .send({ id: 3 })
            .end((err, res) => {
                res.body.status.should.be.equal(200);
                assert.deepEqual(res.body.result, [
                    {
                        "firstName": "John",
                        "lastName": "Doe",
                        "emailAdress": "j.doe@server.com",
                        "phoneNumber": "06 12425475",
                        "street": "",
                        "city": "",
                        "roles": [
                            "editor",
                            "guest"
                        ]
                    }
                ])
                done();
            })
    })
});

describe('UC-404 get detail of the participant at that meal', (done) =>{
    it.skip('TC-404-1 Not logged in system', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants/2')
            .send({ id: 3 })
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.result.should.be.equal('Token is invalid, you cannot sign up.')
                done();
            })
    })

    it('TC-404-2 participant does not exist in meal', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants/5963')
            .send({ id: 3 })
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.result.should.be.equal(`Participant with userID: 5963, does not exist in meal with mealID: 4.`)
                done();
            })
    })

    it('TC-404-3 get details participant', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants/2')
            .send({ id: 3 })
            .end((err, res) => {
                res.body.status.should.be.equal(200);
                assert.deepEqual(res.body.result, {
                    "firstName": "John",
                    "lastName": "Doe",
                    "emailAdress": "j.doe@server.com",
                    "phoneNumber": "06 12425475",
                    "street": "",
                    "city": ""
                })
                done();
            })
    })
    after((done) => {
        DB.getConnection((err, con) => {
            con.query('DELETE FROM user WHERE emailAdress = "Xino@gmail.com";', (err, result) => {
                con.query('ALTER TABLE user AUTO_INCREMENT = 6;', (err, result) => {
                    con.release();
                });
                console.log(result);
            })
        })
        done();
    })
});
//Testcases UC-401 to UC-404