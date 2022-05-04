process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../index');
const DB = require('../../src/data/dbConnection')

//Testcases UC-301 to UC-305
describe('UC-301 add meal to database POST /api/meal', (done) => {
    before((done) => {
        done();
    })
    it('TC-301-1 When required fields are empty, it should send a error message 400', (done) => {
        chai.request(server).post('/api/meal').send({
            user: {
                id: 1,
                firstName: "Wessel",
                lastName: "Pijpers",
                city: "Alphen aan de Rhijn",
                street: "Alphen",
                email: "Wessel@outlook.com",
                password: "NoPassword456",
                isActive: true,
                phoneNumber: "06 12425475"
            },
            meal: {
                description: "Een desert.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                dateTime: "2022-04-27T15:38:30.394Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten"],
                maxAmountOfParticipants: 2,
                price: 2.99,
                createDate: "2022-04-27T15:44:19.615Z",
                updateDate: "2022-04-27T15:44:19.615Z",
                participants: [{
                    id: 0,
                    firstName: "Xin",
                    lastName: "Wang",
                    city: "Rotterdam",
                    street: "Moskouplein",
                    email: "Xin20Wang@outlook.com",
                    password: "NoPassword123",
                    isActive: true,
                    phoneNumber: "06 12425475"
                }
                    ,
                {
                    id: 2,
                    firstName: "Brian",
                    lastName: "Thomson",
                    city: "Rotterdam",
                    street: "Beurs",
                    email: "BrieThom@outlook.com",
                    password: "NoPassword789",
                    isActive: true,
                    phoneNumber: "06 12425475"
                }]
            }
        }).end((req, res) => {
            res.should.be.a('object');
            let { status, result } = res.body;
            assert.equal(status, 400);
            result.should.be.a('string').equals('Name must be filled in or a string');
            done();
        })
    })

    it('TC-301-2 When user is not logged in, it should send a error message 401', (done) => {
        chai.request(server).post('/api/meal').send({

            //Tijdelijk als de user afwezig is, dan geeft dat aan dat de gebruiker nog niet ingelogd is.
            meal: {
                name: 'Pudding',
                description: "Een desert.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                dateTime: "2022-04-27T15:38:30.394Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten"],
                maxAmountOfParticipants: 2,
                price: 2.99,
                createDate: "2022-04-27T15:44:19.615Z",
                updateDate: "2022-04-27T15:44:19.615Z",
                participants: [{
                    id: 0,
                    firstName: "Xin",
                    lastName: "Wang",
                    city: "Rotterdam",
                    street: "Moskouplein",
                    email: "Xin20Wang@outlook.com",
                    password: "NoPassword123",
                    isActive: true,
                    phoneNumber: "06 12425475"
                }
                    ,
                {
                    id: 2,
                    firstName: "Brian",
                    lastName: "Thomson",
                    city: "Rotterdam",
                    street: "Beurs",
                    email: "BrieThom@outlook.com",
                    password: "NoPassword789",
                    isActive: true,
                    phoneNumber: "06 12425475"
                }]
            }
        }).end((req, res) => {
            res.should.be.a('object');
            let { status, result } = res.body;
            assert.equal(status, 401);
            result.should.be.a('string').equals('Must send a user or login required');
            done();
        })
    })

    it('TC-301-3 Succesful meal creation', (done) => {
        chai.request(server).post('/api/meal').send({
            user: {
                id: 1,
                firstName: "Mariëtte",
                lastName: "van den Dullemen",
                isActive: true,
                emailAdress: "m.vandullemen@server.nl",
                password: "secret",
                phoneNumber: "",
                roles: [
                    ""
                ],
                street: "",
                city: ""
            },
            meal: {
                name: "Olijven",
                description: "Test beschrijving",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                dateTime: "2030-01-01T00:00:00.394Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "Olijven", "lactose"],
                maxAmountOfParticipants: 18,
                price: 6.75
            }
        }).end((req, res) => {
            res.should.be.a('object');
            assert.equal(res.body.status, 201);
            res.body.results.should.be.equal('Meal has been added to the database');
            done();
        })
    })

    after((done) => {
        DB.getConnection((error, con) => {
            con.query('DELETE FROM meal WHERE id >= 30', (error, result) => {
                con.query('ALTER TABLE meal AUTO_INCREMENT = 30', (err, res, field) => {
                    con.release();
                })
            })
        })
        done();
    })
})

describe('UC-302 update meal, PUT /api/meal/:mealId', (done) => {

    it('TC-302-1 Required fields (image url as example) are empty', (done) => {
        let id = 99;
        chai.request(server).put('/api/meal/' + id).send({
            user: {
                id: 2,
                firstName: "Brian",
                lastName: "Thomson",
                city: "Rotterdam",
                street: "Beurs",
                email: "BrieThom@outlook.com",
                password: "NoPassword789",
                isActive: true,
                phoneNumber: "06 1242547"
            },
            meal: {
                id: 0,
                name: 'Pudding',
                description: "Een desert.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                dateTime: "2022-04-27T15:38:30.394Z",
                allergenes: ["gluten", "noten"],
                maxAmountOfParticipants: 2,
                price: 2.99,
                createDate: "2022-04-27T15:44:19.615Z",
                updateDate: "2022-04-27T15:44:19.615Z",
                participants: [{
                    id: 0,
                    firstName: "Xin",
                    lastName: "Wang",
                    city: "Rotterdam",
                    street: "Moskouplein",
                    email: "Xin20Wang@outlook.com",
                    password: "NoPassword123",
                    isActive: true,
                    phoneNumber: "06 12425475"
                }
                    ,
                {
                    id: 2,
                    firstName: "Brian",
                    lastName: "Thomson",
                    city: "Rotterdam",
                    street: "Beurs",
                    email: "BrieThom@outlook.com",
                    password: "NoPassword789",
                    isActive: true,
                    phoneNumber: "06 12425475"
                }]
            }
        }).end((req, res) => {
            let { status, result } = res.body;
            status.should.be.equal(400);
            result.should.be.equal('Must have a image url');
            done();
        })
    })
    it('TC-302-2 not logged in', (done) => {
        chai.request(server)
            .put('/api/meal/99')
            .send({
                //No User in de request body
                meal: {
                    id: 99,
                    name: "Patat",
                    description: "Gefrituurde aardappelen, gesneden in dunne kleine stukken.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: false,
                    dateTime: "2022-04-27T15:38:30.394Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: ["gluten", "noten", "lactose"],
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                    cook: 2,
                    createDate: "2022-04-27T15:44:19.615Z",
                    updateDate: "2022-04-27T15:44:19.615Z",
                    participants: [{
                        id: 0,
                        firstName: "Xin",
                        lastName: "Wang",
                        city: "Rotterdam",
                        street: "Moskouplein",
                        email: "Xin20Wang@outlook.com",
                        password: "NoPassword123",
                        isActive: true,
                        phoneNumber: "06 12425475"
                    }
                        ,
                    {
                        id: 2,
                        firstName: "Brian",
                        lastName: "Thomson",
                        city: "Rotterdam",
                        street: "Beurs",
                        email: "BrieThom@outlook.com",
                        password: "NoPassword789",
                        isActive: true,
                        phoneNumber: "06 12425475"
                    }]
                }
            }).end((req, res) => {
                let a = res;
                res.should.be.a('object');
                let { status, result } = res.body;
                assert.equal(status, 401);
                result.should.be.a('string').equals('Must send a user or login required');
                done();
            })
    })

    it('TC-302-3 not the owner of the meal', (done) => {
        let id = 3;
        chai.request(server).put('/api/meal/' + id)
            .send({
                user: {
                    id: 1,
                    firstName: "Wessel",
                    lastName: "Pijpers",
                    city: "Alphen aan de Rhijn",
                    street: "Alphen",
                    email: "Wessel@outlook.com",
                    password: "NoPassword456",
                    isActive: true,
                    phoneNumber: "06 12425475"
                },
                meal: {
                    name: 'Pudding',
                    description: "Een desert.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: false,
                    dateTime: "2022-04-27T15:38:30.394Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: ["gluten", "noten"],
                    maxAmountOfParticipants: 2,
                    price: 2.99,
                    createDate: "2022-04-27T15:44:19.615Z",
                    updateDate: "2022-04-27T15:44:19.615Z"
                }
            }).end((req, res) => {
                let { status, result } = res.body;
                status.should.be.equal(401);
                result.should.be.equal('The user did not own this meal');
                done();
            })
    })

    it('TC-302-4 Meal does not exist', (done) => {
        let id = 99999;
        chai.request(server).put('/api/meal/' + id)
            .send({
                "user": {
                    id: 2,
                    firstName: "Brian",
                    lastName: "Thomson",
                    city: "Rotterdam",
                    street: "Beurs",
                    email: "BrieThom@outlook.com",
                    password: "NoPassword789",
                    isActive: true,
                    phoneNumber: "06 1242547"
                },
                "meal": {
                    id: 0,
                    name: "Patat",
                    description: "Gefrituurde aardappelen, gesneden in dunne kleine stukken.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: false,
                    dateTime: "2022-04-27T15:38:30.394Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: ["gluten", "noten", "lactose"],
                    maxAmountOfParticipants: 6,
                    price: 6.75,
                    cook: 2,
                    createDate: "2022-04-27T15:44:19.615Z",
                    updateDate: "2022-04-27T15:44:19.615Z",
                    participants: [{
                        id: 0,
                        firstName: "Xin",
                        lastName: "Wang",
                        city: "Rotterdam",
                        street: "Moskouplein",
                        email: "Xin20Wang@outlook.com",
                        password: "NoPassword123",
                        isActive: true,
                        phoneNumber: "06 12425475"
                    }
                        ,
                    {
                        id: 2,
                        firstName: "Brian",
                        lastName: "Thomson",
                        city: "Rotterdam",
                        street: "Beurs",
                        email: "BrieThom@outlook.com",
                        password: "NoPassword789",
                        isActive: true,
                        phoneNumber: "06 12425475"
                    }]
                }
            }).end((req, res) => {
                let { status, result } = res.body;
                status.should.be.equal(404);
                result.should.be.equal('Meal does not exist');
                done();
            })
    })

    it('TC-302-5 Succesful update', (done) => {
        let id = 3;
        chai.request(server).put('/api/meal/' + id).send({
            "user": {
                id: 2,
                firstName: 'Herman',
                lastName: 'Huizinga',
                isActive: true,
                emailAdress: 'h.huizinga@server.nl',
                password: 'secret',
                phoneNumber: '06-12345678',
                roles: 'editor,guest',
                street: '',
                city: ''
            },
            "meal": {
                id: 3,
                name: "Echt eten",
                description: "Gefrituurde aardappelen, gesneden in dunne kleine stukken.",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                dateTime: "2022-04-27T15:38:30.394Z",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "lactose"],
                maxAmountOfParticipants: 6,
                price: 6.75,
                cook: 2
            }
        }).end((err, res) => {
            let aa = res;
            res.should.be.a('object');
            let { status, result } = res.body;
            result.should.be.equal('Update completed')
            assert.equal(status, 200);
            done();
        })
    })
    after((done) => {
        DB.getConnection((error, con) => {
            con.query('DELETE FROM meal WHERE id >= 30', (error, result) => {
                con.query('UPDATE meal SET name = "Spaghetti met tapenadekip uit de oven en frisse sa..." WHERE id = 3', (err, res, field) => {
                    con.release();
                })
            })
        })
        done();
    })

})

describe('UC-303 get all meals GET /api/meal/', (done) => {
    it('TC-303 get list of users', (done) => {
        chai.request(server)
            .get('/api/meal')
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equals(200);
                done();
            })
    })
})

describe('UC-304 get meal details.', (done) => {
    it('TC-304-1 Meal does not exist', (done) => {
        let id = 99999999;
        chai.request(server)
            .get('/api/meal/' + id)
            .end((req, res) => {
                res.body.status.should.be.a.equal(404);
                res.body.result.should.be.equal("Meal does not exist");
                done();
            })
    })

    it('TC-304-2 Meal exist, returns meal', (done) => {
        let id = 5;
        chai.request(server)
            .get('/api/meal/' + id)
            .end((req, res) => {
                res.body.status.should.be.equal(200);
                assert.deepEqual(res.body.result, {
                    "id": 5,
                    "isActive": 1,
                    "isVega": 1,
                    "isVegan": 0,
                    "isToTakeHome": 1,
                    "dateTime": "2022-03-26T20:24:46.000Z",
                    "maxAmountOfParticipants": 6,
                    "price": "6.75",
                    "imageUrl": "https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg",
                    "createDate": "2022-03-06T20:26:33.048Z",
                    "updateDate": "2022-03-12T18:50:13.000Z",
                    "name": "Groentenschotel uit de oven",
                    "description": "Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.",
                    "allergenes": [
                        ""
                    ],
                    "cook": {
                        "id": 3,
                        "firstName": "Herman",
                        "lastName": "Huizinga",
                        "isActive": 1,
                        "emailAdress": "h.huizinga@server.nl",
                        "password": "secret",
                        "phoneNumber": "06-12345678",
                        "roles": "editor,guest",
                        "street": "",
                        "city": ""
                    }
                })
                done();
            })
    })
});

describe('UC-305 delete meal test', (done) => {
    before((done) => {
        //Insert query, to test delete function
        DB.getConnection((error, conn) => {
            conn.query('INSERT INTO meal VALUES(999, 1, 1, 1, 1, "2022-05-03T19:36:26.671Z", 3, 19.99, "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg", 4, "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg", "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg", "Fioria", "Onbekend", "");',
                (err, rslt) => {
                    if (err) { throw err };
                    done();
                })
        })
    })
    it('TC-305-2 MNot logged in', (done) => {
        let id = 0;
        chai.request(server)
            .delete('/api/meal/' + id)
            .end((req, res) => {
                res.body.status.should.be.equal(401);
                res.body.result.should.be.equal('Must send a user or login required')
                done();
            })
    })

    it('TC-305-3 Not the owner', (done) => {
        let id = 3;
        chai.request(server)
            .delete('/api/meal/' + id)
            .send({
                user: {
                    id: 1,
                    firstName: 'Mariëtte',
                    lastName: 'van den Dullemen',
                    isActive: 1,
                    emailAdress: 'm.vandullemen@server.nl',
                    password: 'secret',
                    phoneNumber: '',
                    roles: '',
                    street: '',
                    city: ''
                }
            })
            .end((req, res) => {
                res.body.status.should.be.equal(401);
                res.body.result.should.be.equal('The user did not own this meal')
                done();
            })
    })

    it('TC-305-4 Meal does not exist', (done) => {
        let id = 99999;
        chai.request(server)
            .delete('/api/meal/' + id)
            .send({
                user: {
                    id: 1,
                    firstName: 'Mariëtte',
                    lastName: 'van den Dullemen',
                    isActive: 1,
                    emailAdress: 'm.vandullemen@server.nl',
                    password: 'secret',
                    phoneNumber: '',
                    roles: '',
                    street: '',
                    city: ''
                }
            })
            .end((req, res) => {
                res.body.status.should.be.equal(404);
                res.body.result.should.be.equal('Meal does not exist')
                done();
            })
    })

    it('TC-305-5 Meal has been deleted', (done) => {
        let id = 999;
        chai.request(server)
            .delete('/api/meal/' + id)
            .send({
                user: {
                    id: 4,
                    firstName: "Brian",
                    lastName: "Thomson",
                    city: "Rotterdam",
                    street: "Beurs",
                    email: "BrieThom@outlook.com",
                    password: "NoPassword789",
                    isActive: true,
                    phoneNumber: "06 1242547"
                }
            })
            .end((req, res) => {
                res.body.status.should.be.equal(200);
                done();
            })
    })

    after((done) => {
        DB.getConnection((err, con) => {
            con.query('ALTER TABLE meal AUTO_INCREMENT = 30;', (er, res) => {
                con.release();
                done();
            })
        })
    })
});