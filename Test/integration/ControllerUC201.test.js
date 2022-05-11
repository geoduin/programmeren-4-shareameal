process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const { assert, use } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const DB = require('../../src/data/dbConnection');

describe('UC-201 Create new User POST /api/user', (done) => {
    describe('UC-201 set up users', () => {
        before((done) => {
            database = [];
            done();
        });

        it('TC-201-1 When required input is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                emailAdress: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('Title must be a string');
                done();
            })
        })

        it('TC-201-1 When lastName is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                firstName: "Matias",
                city: "Montevideo",
                street: "Straat",
                emailAdress: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('LastName must be a string');
                done();
            })
        })
        it('TC-201-1 When city is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                firstName: "Matias",
                lastName: "Arezo",
                street: "Straat",
                emailAdress: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('City must be a string');
                done();
            })
        })

        it('TC-201-1 When street is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                emailAdress: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('Street must be a string');
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
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('email must be a string');
                done();
            })
        })
        it('TC-201-1 When password is missing, a valid error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Matias",
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                emailAdress: "DoaeM@outlook.com",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('password must be a string');
                done();
            })
        })

        it('TC-201-2 Invalid email format', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "James",
                lastName: "Almada",
                city: "Buenos Aires",
                street: "Pluebo district uno",
                emailAdress: "@outlook.com",
                password: "qweqweqweq",
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message, user } = res.body;
                status.should.be.equals(400);
                message.should.be.a('string').that.equals('Emailadress is invalid. Correct email-format: (at least one character or digit)@(atleast one character or digit).(domain length is either 2 or 3 characters long)');
                //Token test will be tested in the future
                done();
            })
        })

        it('TC-201-3 Invalid password format', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Alphonso",
                lastName: "Davies",
                city: "Ottawa",
                street: "Cardin avenue",
                emailAdress: "m.vandullemen@server.nl",
                password: "oooooooo",
                isActive: true,
                phoneNumber: "06 789032909"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                message.should.be.equals('at least one lowercase character, at least one UPPERCASE character, at least one digit and at least 8 characters long');
                status.should.be.equals(400);
                done();
            })
        })

        //Fixes need to be made
        it('TC-201-4 When email has already been registered, it will return a error message and does not persist within the database', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Alphonso",
                lastName: "Davies",
                city: "Ottawa",
                street: "Cardin avenue",
                emailAdress: "m.vandullemen@server.nl",
                password: "Erika!23Opa",
                isActive: true,
                phoneNumber: "06 789032909"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message } = res.body;
                message.should.be.equals('Email has been taken');
                status.should.be.equals(409);
                done();
            })
        })

        it('TC-201-5 Successful registration', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "James",
                lastName: "Almada",
                city: "Buenos Aires",
                street: "Pluebo district uno",
                emailAdress: "ArezoStanistan@outlook.com",
                password: "Erika!23Opa",
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, message, user } = res.body;
                status.should.be.equals(201);
                message.should.be.a('string').that.equals('User has been registered.');
                //Token test will be tested in the future
                done();
            })
        })

        after((done) => {
            DB.getConnection((err, con) => {
                if (err) { throw err };
                con.query("DELETE FROM user WHERE emailAdress = 'Wessel@outlook.com';", (error, result, field) => {
                    con.query("DELETE FROM user WHERE emailAdress = 'ArezoStanistan@outlook.com';", (error, result, field) => {
                        con.query("ALTER TABLE user AUTO_INCREMENT = 8;", (error, result, field) => {
                            con.release();
                        })
                    })
                })
            })
            done();
        })
        //it('TC-201 When a required inut is missing, a valid error should be'){}
    })


});

//Testcases UC-202 to UC-206 need to be made
describe('UC-202 Get all users Get /api/user', (done) => {
    it('TC-202-1 Empty list', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ searchTerm: 'xqk2' })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, amount, result } = res.body;
                assert.equal(status, 200);
                assert.equal(amount, 0);
                assert.deepEqual(result, []);
                done();
            })
    })
    it('TC-202-2 show two users', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ amount: 2 })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, amount, result } = res.body;
                assert.equal(status, 200);
                assert.equal(amount, 2);
                assert.deepEqual(result, [
                    {
                        "id": 1,
                        "firstName": "Mariëtte",
                        "lastName": "van den Dullemen",
                        "isActive": true,
                        "emailAdress": "m.vandullemen@server.nl",
                        "password": "secret",
                        "phoneNumber": "",
                        "roles": [
                            ""
                        ],
                        "street": "",
                        "city": ""
                    },
                    {
                        "id": 2,
                        "firstName": "John",
                        "lastName": "Doe",
                        "isActive": true,
                        "emailAdress": "j.doe@server.com",
                        "password": "secret",
                        "phoneNumber": "06 12425475",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    }
                ])
                done();
            })
    })

    it('TC-202-3 Search on non-existent name in the database', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ searchTerm: 'xqk2' })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, amount, result } = res.body;
                assert.equal(status, 200);
                assert.equal(amount, 0);
                assert.deepEqual(result, []);
                done();
            })
    })
    it('TC-202-4 show users with active=false', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ isActive: false })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, amount, result } = res.body;
                assert.equal(status, 200);
                assert.equal(amount, 1);
                assert.deepEqual(result,[
                    {
                        "id": 4,
                        "firstName": "Marieke",
                        "lastName": "Van Dam",
                        "isActive": false,
                        "emailAdress": "m.vandam@server.nl",
                        "password": "secret",
                        "phoneNumber": "06-12345678",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    }
                ] )
                result.forEach((item) => {
                    assert.isFalse(item.isActive);
                })
                done();
            })
    })

    it('TC-202-5 show users with active=true', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ isActive: true })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, amount, result } = res.body;
                assert.equal(status, 200);
                assert.equal(amount, 4);
                assert.deepEqual(result, [
                    {
                        "id": 1,
                        "firstName": "Mariëtte",
                        "lastName": "van den Dullemen",
                        "isActive": true,
                        "emailAdress": "m.vandullemen@server.nl",
                        "password": "secret",
                        "phoneNumber": "",
                        "roles": [
                            ""
                        ],
                        "street": "",
                        "city": ""
                    },
                    {
                        "id": 2,
                        "firstName": "John",
                        "lastName": "Doe",
                        "isActive": true,
                        "emailAdress": "j.doe@server.com",
                        "password": "secret",
                        "phoneNumber": "06 12425475",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    },
                    {
                        "id": 3,
                        "firstName": "Herman",
                        "lastName": "Huizinga",
                        "isActive": true,
                        "emailAdress": "h.huizinga@server.nl",
                        "password": "secret",
                        "phoneNumber": "06-12345678",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    },
                    {
                        "id": 5,
                        "firstName": "Henk",
                        "lastName": "Tank",
                        "isActive": true,
                        "emailAdress": "h.tank@server.com",
                        "password": "secret",
                        "phoneNumber": "06 12425495",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    }
                ])
                result.forEach((item) => {
                    assert.isTrue(item.isActive);
                })
                done();
            })
    })
    it('TC-202-6 show users based on searchTerm', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ searchTerm: 'Xin' })
            .end((req, res) => {
                res.should.be.a('object');
                res.status.should.be.equal(200);
                assert(res.body.result, [
                    {
                        "id": 1,
                        "firstName": "Mariëtte",
                        "lastName": "van den Dullemen",
                        "isActive": true,
                        "emailAdress": "m.vandullemen@server.nl",
                        "password": "secret",
                        "phoneNumber": "",
                        "roles": [
                            ""
                        ],
                        "street": "",
                        "city": ""
                    },
                    {
                        "id": 3,
                        "firstName": "Herman",
                        "lastName": "Huizinga",
                        "isActive": true,
                        "emailAdress": "h.huizinga@server.nl",
                        "password": "secret",
                        "phoneNumber": "06-12345678",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    },
                    {
                        "id": 4,
                        "firstName": "Marieke",
                        "lastName": "Van Dam",
                        "isActive": false,
                        "emailAdress": "m.vandam@server.nl",
                        "password": "secret",
                        "phoneNumber": "06-12345678",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": "",
                        "city": ""
                    }
                ])
                done();
            })
    })
});

describe('UC-203 Token GET  /api/user/profile', (done) => {
    it('TC-203-1 Invalid token', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .send({ id: 0 })
            .end((req, res) => {
                let { message, status } = res.body;
                status.should.be.equal(401);
                message.should.be.equal('Correct token functionality has not been implemented');
                done();
            })
    })
    it('TC-203-2 valid token and existing users', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .send({ id: 0 })
            .end((req, res) => {
                let { message, status } = res.body;
                status.should.be.equal(401);
                message.should.be.equal('Correct token functionality has not been implemented');
                done();
            })
    })
});

describe('UC-204 User details checker', (done) => {
    it.skip('TC-204-1 Invalid token', (done) => {
        let id = 99;
        chai.request(server).get('/api/user/' + id)
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result, note } = res.body;
                status.should.be.equal(404);
                result.should.be.equal('Invalid token');
                note.should.be.equal('Token implementation has not been implemented. It is in process');
                done();
            })
    })

    it('TC-204-2 User does not exist', (done) => {
        let id = 99;
        chai.request(server)
            .get('/api/user/' + id)
            //.send({id:1})
            .end((req, res) => {
                res.should.be.a('object');
                let { status, message } = res.body;
                status.should.be.equal(404);
                message.should.be.equal(`User with id: ${id} does not exist. Retrieval has failed.`)
                done();
            })
    })
    it('TC-204-3 user exist', (done) => {
        let userid = 1;
        chai.request(server)
            .get('/api/user/' + userid)
            .send({ id: 1 })
            .end((err, res) => {
                res.should.be.a('object');
                let { status, message, user } = res.body;
                status.should.be.equal(200);
                message.should.be.equal(`User with id: ${userid} found`);
                assert.deepEqual(res.body.user, {
                    id: 1,
                    firstName: 'Mariëtte',
                    lastName: 'van den Dullemen',
                    isActive: true,
                    emailAdress: 'm.vandullemen@server.nl',
                    password: 'secret',
                    phoneNumber: '',
                    roles: [""],
                    street: '',
                    city: '',
                    Own_meals: [
                        {
                            id: 1,
                            isActive: true,
                            isVega: false,
                            isVegan: false,
                            isToTakeHome: true,
                            dateTime: "2022-03-22T17:35:00.000Z",
                            //   dateTime: "2022-03-22T16:35:00.000Z",
                            maxAmountOfParticipants: 4,
                            price: '12.75',
                            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                            cookId: 1,
                            createDate: "2022-02-26T18:12:40.048Z",
                            updateDate: "2022-04-26T12:33:51.000Z",
                            //   createDate: "2022-02-26T17:12:40.048Z",
                            //   updateDate: "2022-04-26T10:33:51.000Z",
                            name: 'Pasta Bolognese met tomaat, spekjes en kaas',
                            description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
                            allergenes: ['gluten','lactose']
                        }
                    ]
                });
                done();
            })
    })
});

describe('UC-205 Update User PUT /api/user/:userId', (done) => {
    before((done) => {
        DB.getConnection((err, con) => {
            con.query('INSERT INTO user VALUES(199, "Xilo", "Phone", 1, "Moomoo@gmail.com", "Secrid", "0612345678", "editor,guest", "XiaXiaStan", "Harbin");', (err, result) => {
                con.release();
                console.log(result);
            })
        })
        done();
    })

    it('TC-205-1 required field missing', (done) => {
        let id = 199;
        chai.request(server)
            .put('/api/user/' + id)
            .send(
                {
                    id: 199,
                    user: {
                        id: 199,
                        firstName: "Xon",
                        lastName: "Wong",
                        city: "Rotterdam",
                        street: "Maskauplein",
                        emailAdress: "Xin20Wang@outlook.com",
                        isActive: true,
                        phoneNumber: "06 1242545"
                    }
                })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, message } = res.body;
                status.should.be.equal(400);
                message.should.be.equal('password must be a string');
                done();
            })
    })

    it('TC-205-3 invalid phonenumber', (done) => {
        let id = 199;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                id: 199,
                user: {
                    id: 199,
                    firstName: "Xon",
                    lastName: "Wong",
                    city: "Rotterdam",
                    street: "Maskauplein",
                    emailAdress: "Xin20Wang@outlook.com",
                    password: "Password111",
                    isActive: true,
                    phoneNumber: "06 124"
                }
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, message } = res.body;
                status.should.be.equal(400);
                message.should.be.equal('Phonenumber must be 9 characters long');
                done();
            })
    })

    it('TC-205-4 User does not exist', (done) => {
        let id = 999;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                id: 0,
                user: {
                    id: 0,
                    firstName: "Xon",
                    lastName: "Wong",
                    city: "Rotterdam",
                    street: "Maskauplein",
                    emailAdress: "Xin20Wang@outlook.com",
                    password: "Password111",
                    isActive: true,
                    phoneNumber: "06 123456789"
                }

            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, message } = res.body;
                status.should.be.equal(400);
                message.should.be.equal(`User does not exist.`);
                done();
            })
    })

    it.skip('TC-205-5 User has not logged in', (done) => {
        let id = 199;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                //It lacks a id attribute above the user object.
                //Will be replaced by a token
                user: {
                    id: 0,
                    firstName: "Xon",
                    lastName: "Wong",
                    city: "Rotterdam",
                    street: "Maskauplein",
                    emailAdress: "Xin20Wang@outlook.com",
                    password: "Password111",
                    isActive: true,
                    phoneNumber: "06 123456789"
                }
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equal(401);
                result.should.be.equal('User has not been logged in');
                done();
            })
    })

    it('TC-205-6 User successfully updated', (done) => {
        let id = 199;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                //Placeholder object
                id: 199,
                user: {
                    id: 199,
                    firstName: "Xon",
                    lastName: "Wong",
                    city: "Rotterdam",
                    street: "Maskauplein",
                    emailAdress: "Xin20Wang@outlook.com",
                    password: "Password111",
                    isActive: true,
                    phoneNumber: "06 123456789"
                }
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, message, updatedUser } = res.body;
                message.should.be.equal("Succesful transaction");
                status.should.be.equal(200);
                assert.deepEqual(updatedUser, {
                    id: 199,
                    firstName: "Xon",
                    lastName: "Wong",
                    city: "Rotterdam",
                    street: "Maskauplein",
                    emailAdress: "Xin20Wang@outlook.com",
                    password: "Password111",
                    isActive: true,
                    roles: ["editor", "guest"],
                    phoneNumber: "06 123456789"
                })
                done();
            })
    })
    after((done) => {
        DB.getConnection((err, con) => {
            con.query('DELETE FROM user WHERE emailAdress = "Xin20Wang@outlook.com";', (err, result) => {
                con.query('ALTER TABLE user AUTO_INCREMENT = 6;', (err, result) => {
                    con.release();
                });
                console.log(result);
            })
        })
        done();
    })
});

describe('UC-206 Delete user DELETE /api/user/:userId', (done) => {
    before((done) => {
        DB.getConnection((err, con) => {
            con.query('INSERT INTO user VALUES(200, "Jessie", "Kessier", 0, "Jessie@hotmail.com", "Secrid", "0612345678", "editor,guest", "La ", "Marseille");', (err, result) => {
                con.release();
            })
        })
        done();
    })


    it('TC-206-1 User does not exist', (done) => {
        let id = 99999;
        chai.request(server)
            .delete('/api/user/' + id)
            .send({ id: 200 })
            .end((req, res) => {
                let { status, message } = res.body;
                status.should.be.equal(400);
                message.should.be.equal('User does not exist');
                done();
            })
    })
    //Either token or user object will be send to
    it.skip('TC-206-2 User not logged in', (done) => {
        let id = 200;
        chai.request(server)
            .delete('/api/user/' + id)
            //No object send
            .end((req, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('User has not been logged in');
                done();
            })
    })
    it('TC-206-3 User not the owner of user', (done) => {
        let id = 200;
        chai.request(server)
            .delete('/api/user/' + id)
            .send({ id: 201 })
            .end((req, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal(`This user does not own user with ID ${id}`);
                done();
            })
    })
    it('TC-206-4 User succesfully deleted', (done) => {
        let id = 200;
        chai.request(server)
            .delete('/api/user/' + id)
            //Placeholder method
            .send({ id: 200 })
            .end((req, res) => {
                let { status, message } = res.body;
                status.should.be.equal(200);
                message.should.be.equal(`User with user with Id ${id}, has been removed.`);
                done();
            })
    })

    after((done) => {
        DB.getConnection((err, con) => {
            con.query('DELETE FROM user WHERE id = 200;', (err, result) => {
                con.query('ALTER TABLE user AUTO_INCREMENT = 8');
                console.log(result);
            })
        })
        done();
    })
})
