process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const { it } = require('mocha');
const server = require('../../index');
const { jwtSecretKey, logger } = require('../../src/config/config');
const DB = require('../../src/data/dbConnection')
const tokens = require('../../src/tokens/UserTokens.token');

//Testcases UC-301 to UC-305
describe('UC-301 add meal to database POST /api/meal', (done) => {
    before((done) => {
        done();
    })
    it('TC-301-1 When required fields are empty, it should send a error message 400', (done) => {
        chai.request(server)
            .post('/api/meal')
            .auth(tokens.Marieke, { type: 'bearer' })
            .send({
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
            }).end((req, res) => {
                res.should.be.a('object');
                let { status, message } = res.body;
                assert.equal(status, 400);
                message.should.be.a('string').equals('Name must be filled in or a string');
                done();
            })
    })

    it('TC-301-2 When user is not logged in, it should send a error message 401', (done) => {
        chai.request(server)
            .post('/api/meal')
            .send({
                //Tijdelijk als de user afwezig is, dan geeft dat aan dat de gebruiker nog niet ingelogd is.
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
            }).end((req, res) => {
                res.should.be.a('object');
                let { status, message } = res.body;
                assert.equal(status, 401);
                message.should.be.a('string').equals('Not logged in');
                done();
            })
    })

    it('TC-301-3 Succesful meal creation', (done) => {
        chai.request(server)
            .post('/api/meal')
            .auth(tokens.Marieke, { type: 'bearer' })
            .send({
                name: "Olijven",
                description: "Test beschrijving",
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: false,
                dateTime: "2030-01-01 00:00:00",
                imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                allergenes: ["gluten", "noten", "lactose"],
                maxAmountOfParticipants: 18,
                price: 6.75
            }).end((req, res) => {
                res.should.be.a('object');
                assert.equal(res.body.status, 201);
                res.body.result.should.be.a('object');
                assert.deepEqual(res.body.result, {
                    id: res.body.result.id,
                    isActive: false,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: false,
                    dateTime: "2030-01-01T00:00:00.000Z",
                    maxAmountOfParticipants: 18,
                    price: 6.75,
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    cook: {
                        "city": "",
                        "emailAdress": "m.vandam@server.nl",
                        "firstName": "Marieke",
                        "id": 4,
                        "isActive": false,
                        "lastName": "Van Dam",
                        "phoneNumber": "06-12345678",
                        "roles": [
                            "editor",
                            "guest"
                        ],
                        "street": ""
                    },
                    //Deze variabelen krijgen bij iedere aanmaak een automatische datum en dus iedere keer een datum tijd, geldt ook voor Id.
                    createDate: res.body.result.createDate,
                    updateDate: res.body.result.updateDate,
                    name: "Olijven",
                    description: "Test beschrijving",
                    allergenes: [
                        "gluten",
                        "lactose",
                        "noten",
                    ],
                    participants: [
                        {
                            "city": "",
                            "emailAdress": "m.vandam@server.nl",
                            "firstName": "Marieke",
                            "id": 4,
                            "isActive": false,
                            "lastName": "Van Dam",
                            "phoneNumber": "06-12345678",
                            "roles": [
                                "editor",
                                "guest"
                            ],
                            "street": ""
                        }
                    ]
                })
                done();
            })
    })

    after((done) => {
        DB.getConnection((error, con) => {
            con.query('DELETE FROM meal WHERE id >= 6', (error, result) => {
                con.query('ALTER TABLE meal AUTO_INCREMENT = 6', (err, res, field) => {
                    con.release();
                    done();
                })
            })
        })
    })
})
describe('UC-303 get all meals GET /api/meal/', (done) => {
    before((done) => {
        DB.getConnection((error, con) => {
            con.query('UPDATE meal SET name = "Spaghetti met tapenadekip uit de oven en frisse salade", updateDate = "2022-03-15T14:10:19.000Z" WHERE id = 3; DELETE FROM meal WHERE id = 36;', (error, result) => {
                con.release();
                done();
            })
        })
    })

    it('TC-303 get list of users', (done) => {
        chai.request(server)
            .get('/api/meal')
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equals(200);
                assert.deepEqual(result, [
                    {
                        "id": 1,
                        "isActive": true,
                        "isVega": false,
                        "isVegan": false,
                        "isToTakeHome": true,
                        "dateTime": "2022-03-22T17:35:00.000Z",
                        "maxAmountOfParticipants": 4,
                        "price": 12.75,
                        "imageUrl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                        "createDate": "2022-02-26T18:12:40.048Z",
                        "updateDate": "2022-04-26T12:33:51.000Z",
                        "name": "Pasta Bolognese met tomaat, spekjes en kaas",
                        "description": "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
                        "allergenes": [
                            "gluten",
                            "lactose"
                        ],
                        "cook": {
                            "id": 1,
                            "firstName": "Mariëtte",
                            "lastName": "van den Dullemen",
                            "isActive": true,
                            "emailAdress": "m.vandullemen@server.nl",
                            "roles": [
                                ""
                            ],
                            "phoneNumber": "",
                            "city": "",
                            "street": ""
                        },
                        "participants": [
                            {
                                "id": 2,
                                "firstName": "John",
                                "lastName": "Doe",
                                "isActive": true,
                                "emailAdress": "j.doe@server.com",
                                "phoneNumber": "06 12425475",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            },
                            {
                                "id": 3,
                                "firstName": "Herman",
                                "lastName": "Huizinga",
                                "isActive": true,
                                "emailAdress": "h.huizinga@server.nl",
                                "phoneNumber": "06-12345678",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            },
                            {
                                "id": 5,
                                "firstName": "Henk",
                                "lastName": "Tank",
                                "isActive": true,
                                "emailAdress": "h.tank@server.com",
                                "phoneNumber": "06 12425495",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "isActive": true,
                        "isVega": true,
                        "isVegan": false,
                        "isToTakeHome": false,
                        "dateTime": "2022-05-22T13:35:00.000Z",
                        "maxAmountOfParticipants": 4,
                        "price": 12.75,
                        "imageUrl": "https://static.ah.nl/static/recepten/img_RAM_PRD159322_1024x748_JPG.jpg",
                        "createDate": "2022-02-26T18:12:40.048Z",
                        "updateDate": "2022-04-25T12:56:05.000Z",
                        "name": "Aubergine uit de oven met feta, muntrijst en tomatensaus",
                        "description": "Door aubergines in de oven te roosteren worden ze heerlijk zacht. De balsamico maakt ze heerlijk zoet.",
                        "allergenes": [
                            "noten"
                        ],
                        "cook": {
                            "id": 2,
                            "firstName": "John",
                            "lastName": "Doe",
                            "isActive": true,
                            "emailAdress": "j.doe@server.com",
                            "roles": [
                                "editor",
                                "guest"
                            ],
                            "phoneNumber": "06 12425475",
                            "city": "",
                            "street": ""
                        },
                        "participants": [
                            {
                                "id": 4,
                                "firstName": "Marieke",
                                "lastName": "Van Dam",
                                "isActive": false,
                                "emailAdress": "m.vandam@server.nl",
                                "phoneNumber": "06-12345678",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "isActive": true,
                        "isVega": false,
                        "isVegan": false,
                        "isToTakeHome": true,
                        "dateTime": "2022-05-22T17:30:00.000Z",
                        "maxAmountOfParticipants": 4,
                        "price": 10.75,
                        "imageUrl": "https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg",
                        "createDate": "2022-02-26T18:12:40.048Z",
                        "updateDate": "2022-03-15T14:10:19.000Z",
                        "name": "Spaghetti met tapenadekip uit de oven en frisse salade",
                        "description": "Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.",
                        "allergenes": [
                            "gluten",
                            "lactose"
                        ],
                        "cook": {
                            "id": 2,
                            "firstName": "John",
                            "lastName": "Doe",
                            "isActive": true,
                            "emailAdress": "j.doe@server.com",
                            "roles": [
                                "editor",
                                "guest"
                            ],
                            "phoneNumber": "06 12425475",
                            "city": "",
                            "street": ""
                        },
                        "participants": [
                            {
                                "id": 3,
                                "firstName": "Herman",
                                "lastName": "Huizinga",
                                "isActive": true,
                                "emailAdress": "h.huizinga@server.nl",
                                "phoneNumber": "06-12345678",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            },
                            {
                                "id": 4,
                                "firstName": "Marieke",
                                "lastName": "Van Dam",
                                "isActive": false,
                                "emailAdress": "m.vandam@server.nl",
                                "phoneNumber": "06-12345678",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "isActive": true,
                        "isVega": false,
                        "isVegan": false,
                        "isToTakeHome": false,
                        "dateTime": "2022-03-26T21:22:26.000Z",
                        "maxAmountOfParticipants": 4,
                        "price": 4.00,
                        "imageUrl": "https://static.ah.nl/static/recepten/img_063387_890x594_JPG.jpg",
                        "createDate": "2022-03-06T21:23:45.419Z",
                        "updateDate": "2022-03-12T19:51:57.000Z",
                        "name": "Zuurkool met spekjes",
                        "description": "Heerlijke zuurkoolschotel, dé winterkost bij uitstek. ",
                        "allergenes": [""],
                        "cook": {
                            "id": 3,
                            "firstName": "Herman",
                            "lastName": "Huizinga",
                            "isActive": true,
                            "emailAdress": "h.huizinga@server.nl",
                            "roles": [
                                "editor",
                                "guest"
                            ],
                            "phoneNumber": "06-12345678",
                            "city": "",
                            "street": ""
                        },
                        "participants": [
                            {
                                "id": 2,
                                "firstName": "John",
                                "lastName": "Doe",
                                "isActive": true,
                                "emailAdress": "j.doe@server.com",
                                "phoneNumber": "06 12425475",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            }
                        ]
                    },
                    {
                        "id": 5,
                        "isActive": true,
                        "isVega": true,
                        "isVegan": false,
                        "isToTakeHome": true,
                        "dateTime": "2022-03-26T21:24:46.000Z",
                        "maxAmountOfParticipants": 6,
                        "price": 6.75,
                        "imageUrl": "https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg",
                        "createDate": "2022-03-06T21:26:33.048Z",
                        "updateDate": "2022-03-12T19:50:13.000Z",
                        "name": "Groentenschotel uit de oven",
                        "description": "Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.",
                        "allergenes": [""],
                        "cook": {
                            "id": 3,
                            "firstName": "Herman",
                            "lastName": "Huizinga",
                            "isActive": true,
                            "emailAdress": "h.huizinga@server.nl",
                            "roles": [
                                "editor",
                                "guest"
                            ],
                            "phoneNumber": "06-12345678",
                            "city": "",
                            "street": ""
                        },
                        "participants": [
                            {
                                "id": 4,
                                "firstName": "Marieke",
                                "lastName": "Van Dam",
                                "isActive": false,
                                "emailAdress": "m.vandam@server.nl",
                                "phoneNumber": "06-12345678",
                                "roles": ["editor", "guest"],
                                "street": "",
                                "city": ""
                            }
                        ]
                    }
                ]
                )
                done();
            })
    })
})
describe('UC-302 update meal, PUT /api/meal/:mealId', (done) => {

    it('TC-302-1 Required fields (image url as example) are empty', (done) => {
        let id = 99;
        chai.request(server)
            .put('/api/meal/' + id)
            .auth(tokens.Marieke, { type: 'bearer' })
            .send({
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
            }).end((req, res) => {
                let { status, message } = res.body;
                status.should.be.equal(400);
                message.should.be.equal('Must have a image url');
                done();
            })
    })
    it('TC-302-2 not logged in', (done) => {
        chai.request(server)
            .put('/api/meal/99')
            .send(
                {
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
                }
            ).end((req, res) => {
                let a = res;
                res.should.be.a('object');
                let { status, message } = res.body;
                assert.equal(status, 401);
                message.should.be.a('string').equals('Not logged in');
                done();
            })
    })

    it('TC-302-3 not the owner of the meal', (done) => {
        let id = 3;
        chai.request(server)
            .put('/api/meal/' + id)
            .auth(tokens.Mariete, { type: 'bearer' })
            .send({
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
            }).end((req, res) => {
                let { status, message } = res.body;
                status.should.be.equal(401);
                message.should.be.equal('The user did not own this meal');
                done();
            })
    })

    it('TC-302-4 Meal does not exist', (done) => {
        let id = 99999;
        chai.request(server)
            .put('/api/meal/' + id)
            .auth(tokens.Mariete, { type: 'bearer' })
            .send({
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
            }).end((req, res) => {
                let { status, message } = res.body;
                status.should.be.equal(404);
                message.should.be.equal('Meal does not exist');
                done();
            })
    })

    it('TC-302-5 Succesful update', (done) => {
        let id = 3;
        chai.request(server)
            .put('/api/meal/' + id)
            .auth(tokens.John, { type: 'bearer' })
            .send({
                id: 3,
                name: "Italiaanse Ramen",
                description: "Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2022-05-22 17:30:00",
                imageUrl: "https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg",
                allergenes: ["gluten", "lactose"],
                maxAmountOfParticipants: 4,
                price: 10.75,
                cook: 2
            }).end((err, res) => {
                let aa = res;
                res.should.be.a('object');
                let { status, result } = res.body;
                assert.equal(status, 200);
                assert.deepEqual(result, {
                    id: 3,
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: true,
                    dateTime: "2022-05-22T17:30:00.000Z",
                    maxAmountOfParticipants: 4,
                    price: 10.75,
                    imageUrl: "https://static.ah.nl/static/recepten/img_099918_1024x748_JPG.jpg",
                    cookId: 2,
                    createDate: "2022-02-26T18:12:40.048Z",
                    updateDate: result.updateDate,
                    name: "Italiaanse Ramen",
                    description: "Perfect voor doordeweeks, maar ook voor gasten tijdens een feestelijk avondje.",
                    allergenes: ["gluten", "lactose"],
                })
                done();
            })
    })
    after((done) => {
        DB.getConnection((error, con) => {
            con.query('UPDATE meal SET name = "Spaghetti met tapenadekip uit de oven en frisse salade", updateDate = "2022-03-15T14:10:19.000Z" WHERE id = 3;', (error, result) => {
                con.release();
                done();
            })
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
                res.body.message.should.be.equal("Meal does not exist");
                done();
            })
    })
    //LET OP op de github-action integratietesten voldoet alleen deze test als de createDate, updateDate en datetime 1 uur later vermeld staat. 
    //De test slaagt dus op localhost niet.
    it('TC-304-2 Meal exist, returns meal', (done) => {
        let id = 5;
        chai.request(server)
            .get('/api/meal/' + id)
            .end((req, res) => {
                res.body.status.should.be.equal(200);
                assert.deepEqual(res.body.result, {
                    id: 5,
                    isActive: true,
                    isVega: true,
                    isVegan: false,
                    isToTakeHome: true,
                    dateTime: "2022-03-26T21:24:46.000Z",
                    maxAmountOfParticipants: 6,
                    price: '6.75',
                    imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
                    createDate: "2022-03-06T21:26:33.048Z",
                    updateDate: "2022-03-12T19:50:13.000Z",
                    name: 'Groentenschotel uit de oven',
                    description: 'Misschien wel de lekkerste schotel uit de oven! En vol vitaminen! Dat wordt smikkelen. Als je van groenten houdt ben je van harte welkom. Wel eerst even aanmelden.',
                    allergenes: [''],
                    cook: {
                        id: 3,
                        firstName: 'Herman',
                        lastName: 'Huizinga',
                        isActive: true,
                        emailAdress: 'h.huizinga@server.nl',
                        phoneNumber: '06-12345678',
                        roles: ['editor', 'guest'],
                        street: '',
                        city: ''
                    },
                    participants: [
                        {
                            city: "",
                            emailAdress: "m.vandam@server.nl",
                            firstName: "Marieke",
                            id: 4,
                            isActive: false,
                            lastName: "Van Dam",
                            phoneNumber: "06-12345678",
                            roles: [
                                "editor",
                                "guest"
                            ],
                            street: ""
                        }
                    ]
                })
                done();
            })
    })
});

describe('UC-305 delete meal test', (done) => {
    before((done) => {
        //Insert query, to test delete function
        DB.getConnection((error, conn) => {
            conn.query('INSERT INTO meal VALUES(999,1,0,0,1,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",1,"2022-02-26 18:12:40.048998","2022-04-26 12:33:51.000000","Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose");',
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
            //No login send
            .end((req, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('Not logged in')
                done();
            })
    })

    it('TC-305-3 Not the owner', (done) => {
        let id = 3;
        chai.request(server)
            .delete('/api/meal/' + id)
            .auth(tokens.Mariete, { type: 'bearer' })
            .end((req, res) => {
                res.body.status.should.be.equal(401);
                res.body.message.should.be.equal('The user did not own this meal')
                done();
            })
    })

    it('TC-305-4 Meal does not exist', (done) => {
        let id = 99999;
        chai.request(server)
            .delete('/api/meal/' + id)
            .auth(tokens.Marieke, { type: 'bearer' })
            .end((req, res) => {
                res.body.status.should.be.equal(404);
                res.body.message.should.be.equal('Meal does not exist')
                done();
            })
    })

    it('TC-305-5 Meal has been deleted', (done) => {
        let id = 999;
        chai.request(server)
            .delete('/api/meal/' + id)
            .auth(tokens.Mariete, { type: 'bearer' })
            .end((req, res) => {
                res.body.message.should.be.equal('Meal removed')
                res.body.status.should.be.equal(200);
                done();
            })
    })

    after((done) => {
        DB.getConnection((err, con) => {
            con.query('DELETE FROM meal WHERE id = 999; ALTER TABLE meal AUTO_INCREMENT = 30;', (er, res) => {
                con.release();
                done();
            })
        })
    })
});