process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require('../../src/config/config');
const DB = require('../../src/data/dbConnection')
const tokens = require('../../src/tokens/UserTokens.token');

describe('UC-401 sign on participation', (done) => {
    before((done) => {
        done();
    })

    it('TC-401-1 Not logged in system', (done) => {
        chai.request(server)
            .post('/api/meal/2/participate')
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('Not logged in')
                done();
            })
    })

    it('TC-401-2 Meal does not exist', (done) => {
        chai.request(server)
            .post('/api/meal/99999/participate')
            .auth(tokens.Henk, { type: 'bearer' })
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.message.should.be.equal('Meal does not exist!')
                done();
            })
    })

    it('TC-401-3 Successfully particpated in meal', (done) => {
        chai.request(server)
            .post('/api/meal/2/participate')
            //John {id: 2}
            .auth(tokens.John, { type: 'bearer' })
            .end((err, res) => {
                let aa = res.body;
                res.body.status.should.be.equal(200);
                res.body.result.currentlyParticipating.should.be.equal(true);
                done();
            })
    })

    after((done) => {
        DB.getConnection((err, con) => {
            con.query("DELETE FROM `meal_participants_user` WHERE mealId = 2 AND userId = 2;", (error, result) => {
                con.release();
                done();
            })
        })
    })
});
describe('UC-402 sign off participation', (done) => {
    before((done) => {
        DB.getConnection((error, connect) => {
            connect.query('INSERT INTO `meal_participants_user` VALUES (1,1);', (err, result) => {
                connect.release();
                done();
            })
        })
    })

    it('TC-402-1 Not logged in system', (done) => {
        chai.request(server)
            .put('/api/meal/2/signOff')
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('Not logged in')
                done();
            })
    })

    it('TC-402-2 meal does not exist', (done) => {
        chai.request(server)
            .put('/api/meal/100000/signOff')
            .auth(tokens.Marieke, { type: 'bearer' })
            .end((err, res) => {
                res.body.message.should.be.equal('Meal does not exist!')
                res.body.status.should.be.equal(404);
                done();
            })
    })

    it('TC-402-3 sign up does not exist', (done) => {
        let userId = 99;
        let mealId = 66;
        chai.request(server)
            .put('/api/meal/' + mealId + '/signOff')
            .set(
                'authorization',
                'Bearer ' + jwt.sign({ id: userId }, jwtSecretKey, {expiresIn:'99d'})
            )
            .end((err, res) => {
                let {status, message} = res.body;
                message.should.be.equal(`Meal does not exist!`)
                status.should.be.equal(404);
                done();
            })
    })

    it('TC-402-4 Succesfully signed off participation from a meal', (done) => {
        let userId = 1;
        let mealId = 1;
        chai.request(server)
            .put('/api/meal/' + mealId + '/signOff')
            //Id {id:1};
            .auth(tokens.Mariete, {type:'bearer'})
            .end((err, res) => {
                let {status, result } =res.body;
                status.should.be.equal(200);
                result.message.should.be.equal(`Participation of USERID => ${userId} with MEALID => ${mealId} has been removed.`);
                result.currentlyParticipating.should.be.equal(false);
                done();
            })
    })

    after((done) => {
        DB.getConnection((error, connect) => {
            connect.query('DELETE FROM `meal_participants_user` WHERE mealId = 1 AND userId = 1;', (err, result) => {
                connect.release();
                done();
            })
        })
    })
});
describe('UC-403 get all participants of that meal', (done) => {
    it('TC-403-1 Not logged in system', (done) => {
        chai.request(server)
            .get('/api/meal/1/participants')
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('Not logged in')
                done();
            })
    })

    it('TC-403-2 participant does not exist in meal', (done) => {
        chai.request(server)
            .get('/api/meal/8567/participants')
            .auth(tokens.Mariete , { type:'bearer'})
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.message.should.be.equal('Meal does not exist!')
                done();
            })
    })

    it('TC-403-3 get list of participants', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants')
            .auth(tokens.Herman,{type:'bearer'})
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

describe('UC-404 get detail of the participant at that meal', (done) => {
    it('TC-404-1 Not logged in system', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants/2')
            .end((err, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('Not logged in')
                done();
            })
    })

    it('TC-404-2 participant does not exist in meal', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants/5963')
            .auth(tokens.Herman, {type:'bearer'})
            .end((err, res) => {
                res.body.status.should.be.equal(404);
                res.body.message.should.be.equal(`Participant with userID: 5963, does not exist in meal with mealID: 4.`)
                done();
            })
    })

    it('TC-404-3 get details participant', (done) => {
        chai.request(server)
            .get('/api/meal/4/participants/2')
            .auth(tokens.Herman, {type:'bearer'})
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
            })
        })
        done();
    })
});
