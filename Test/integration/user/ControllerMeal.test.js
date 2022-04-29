const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { it } = require('mocha');
const server = require('../../../index');

//Testcases UC-301 to UC-305
describe('UC-301 add meal to database POST /api/meal', (done) => {
    beforeEach((done) => {
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
            assert.equal(status, 200);
            result.should.be.a('string').equals('Meal added to meal database');
            done();
        })
    })
})

describe('UC-302 update meal, PUT /api/meal/:mealId', (done) => {
    describe('UC-302 TESTING', () => {
        it('TC-302-5 Succesful update', (done) => {
            let id = 0;
            chai.request(server).put('/api/meal/' + id).send({
                "user": {
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
            }).end((err, res) => {
                let aa = res;
                res.should.be.a('object');
                let { status, result } = res.body;
                assert.equal(status, 200);
                done();
            })
        })

        it('TC-302-2 not logged in', (done) => {
            chai.request(server)
                .put('/api/meal/0')
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
                    let a = res;
                    res.should.be.a('object');
                    let { status, result } = res.body;
                    assert.equal(status, 401);
                    result.should.be.a('string').equals('Must send a user or login required');
                    done();
                })
        })
    })


    //TC-302-1 Verplicht veld ontbreekt
    //TC-302-3 niet de eigenaar van de maaltijd
    //TC-302-4 Maaltijd bestaat niet
})

describe('UC-303 get all meals GET /api/meal/', (done) => {
    it('TC-303 get list of users', (done) => {
        chai.request(server).get('/api/meal').send({

        })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equals(200);
                done();
            })
    })
})

//describe('UC-304 get meal details.', (done) =>{});
//describe('UC-305 delete meal test',(done) =>{});