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


        //Fixes need to be made
        it('TC-201-3 tot -5 When email has already been registered, it will return a error message and does not persist within the database', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Alphonso",
                lastName: "Davies",
                city: "Ottawa",
                street: "Cardin avenue",
                email: "m.vandullemen@server.nl",
                password: "qweqweqweq",
                isActive: true,
                phoneNumber: "08 789032909"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                result.should.be.equals('Email has been taken');
                status.should.be.equals(401);
                done();
            })
        })

        it('TC-201-5 Successful registration', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "James",
                lastName: "Almada",
                city: "Buenos Aires",
                street: "Pluebo district uno",
                email: "ArezoStanistan@outlook.com",
                password: "qweqweqweq",
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result, user } = res.body;
                status.should.be.equals(200);
                result.should.be.a('string').that.equals('User has been registered.');
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
                let { status } = res.body;
                assert.equal(status, 200);
                done();
            })
    })
    it('TC-202-2 show two users', (done) => {
        chai.request(server)
            .get('/api/user')
            .query({ amount: 2 })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, amount } = res.body;
                assert.equal(status, 200);
                assert.equal(amount, 2);
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
                done();
            })
    })
});

describe('UC-203 Token GET  /api/user/profile', (done) => {
    it('TC-203-1 Invalid token', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .end((req, res) => {
                let { result, status } = res.body;
                status.should.be.equal(401);
                result.should.be.equal('Correct token functionality has not been implemented');
                done();
            })
    })
    it('TC-203-2 valid token and existing users', (done) => {
        chai.request(server).get('/api/user/profile')
            .end((req, res) => {
                let { result, status } = res.body;
                status.should.be.equal(401);
                result.should.be.equal('Correct token functionality has not been implemented');
                done();
            })
    })
});

describe('UC-204 User details checker', (done) => {
    it.skip('TC-204-2 Invalid token', (done) => {
        chai.request(server).delete('/api/user').send({

        }).end((req, res) => {
            res.should.be.a('object');
            let { status, result } = res.body;
            status.should.be.equal(404);
            done();
        })
    })
    it('TC-204-1 User does not exist', (done) => {
        let id = 99;
        chai.request(server)
            .get('/api/user/' + id)
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equal(404);
                result.should.be.equal(`User with id: ${id} does not exist. Retrieval has failed.`)
                done();
            })
    })
    it('TC-204 user exist', (done) => {
        let userid = 1;
        chai.request(server)
            .get('/api/user/' + userid)
            .end((err, res) => {
                res.should.be.a('object');
                let { status, result, user } = res.body;
                status.should.be.equal(202);
                result.should.be.equal(`User with id: ${userid} found`);
                let {id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city} = user;
                assert.deepEqual(res.body.user, {
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
                  });
                done();
            })
    })
});

describe('UC-205 Update User PUT /api/user/:userId', (done) => {
    before((done)=>{
        DB.getConnection((err, con)=>{
            con.query('INSERT INTO user VALUES(199, "Xilo", "Phone", 1, "Moomoo@gmail.com", "Secrid", "0612345678", "editor,guest", "XiaXiaStan", "Harbin");', (err, result)=>{
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
            .send({
                id: 199,
                firstName: "Xon",
                lastName: "Wong",
                city: "Rotterdam",
                street: "Maskauplein",
                email: "Xin20Wang@outlook.com",
                isActive: true,
                phoneNumber: "06 1242545"
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equal(400);
                done();
            })
    })

    it('TC-205-3 invalid phonenumber', (done) => {
        let id = 199;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                id: 199,
                firstName: "Xon",
                lastName: "Wong",
                city: "Rotterdam",
                street: "Maskauplein",
                email: "Xin20Wang@outlook.com",
                password: "Password111",
                isActive: true,
                phoneNumber: "06 124"
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equal(400);
                result.should.be.equal('Phonenumber must be 9 characters long');
                done();
            })
    })

    it('TC-205-4 User does not exist', (done) => {
        let id = 999;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                id: 0,
                firstName: "Xon",
                lastName: "Wong",
                city: "Rotterdam",
                street: "Maskauplein",
                email: "Xin20Wang@outlook.com",
                password: "Password111",
                isActive: true,
                phoneNumber: "06 123456789"
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result } = res.body;
                status.should.be.equal(404);
                result.should.be.equal(`Update has failed. Id: ${id} does not exist.`);
                done();
            })
    })

    it.skip('TC-205-5 User has not logged in', (done) => {
        let id =199;
        chai.request(server)
            .put('/api/user/' + id)
            .send({
                id: 0,
                firstName: "Xon",
                lastName: "Wong",
                city: "Rotterdam",
                street: "Maskauplein",
                email: "Xin20Wang@outlook.com",
                password: "Password111",
                isActive: true,
                phoneNumber: "06 123456789"
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
                id: 199,
                firstName: "Xon",
                lastName: "Wong",
                city: "Rotterdam",
                street: "Maskauplein",
                email: "Xin20Wang@outlook.com",
                password: "Password111",
                isActive: true,
                phoneNumber: "06 123456789"
            })
            .end((req, res) => {
                res.should.be.a('object');
                let { status, result, updatedUser } = res.body;
                status.should.be.equal(200);
                result.should.be.equal("Succesful transaction");
                assert.deepEqual(updatedUser, {
                    id: 199,
                    firstName: "Xon",
                    lastName: "Wong",
                    city: "Rotterdam",
                    street: "Maskauplein",
                    email: "Xin20Wang@outlook.com",
                    password: "Password111",
                    isActive: true,
                    phoneNumber: "06 123456789"
                })
                done();
            })
    })
    after((done)=>{
        DB.getConnection((err, con)=>{
            con.query('DELETE FROM user WHERE id = 199;', (err, result)=>{
                con.query('ALTER TABLE user AUTO_INCREMENT = 8');
                console.log(result);
            })
        })
        done();
    })
});

describe('UC-206 Delete user DELETE /api/user/:userId', (done) => {
    before((done)=>{
        DB.getConnection((err, con)=>{
            con.query('INSERT INTO user VALUES(200, "Jessie", "Kessier", 0, "Jessie@hotmail.com", "Secrid", "0612345678", "editor,guest", "La ", "Marseille");', (err, result)=>{
                con.release();
                console.log(result);
            })
        })
        done();
    })


    it('TC-206-1 User does not exist', (done) => {
        let id = 99999;
        chai.request(server)
            .delete('/api/user/' + id)
            .end((req, res) => {
                let { status, result } = res.body;
                status.should.be.equal(404);
                result.should.be.equal(`Removal has failed. Id ${id} has either been removed or does not exist`);
                done();
            })
    })
    it.skip('TC-206-2 User not logged in', (done) => {
        let id = 0;
        chai.request(server)
            .delete('/api/user/' + id)
            .end((req, res) => {
                done();
            })
    })
    it.skip('TC-206-3 User not the owner of user', (done) => {
        let id = 200;
        chai.request(server)
            .delete('/api/user/' + id)
            .end((req, res) => {
                done();
            })
    })
    it('TC-206-4 User succesfully deleted', (done) => {
        let id = 200;
        chai.request(server)
            .delete('/api/user/' + id)
            .end((req, res) => {
                let { status, result } = res.body;
                status.should.be.equal(200);
                result.should.be.equal(`User with user with Id ${id}, has been removed.`);
                done();
            })
    })

    after((done)=>{
        DB.getConnection((err, con)=>{
            con.query('DELETE FROM user WHERE id = 200;', (err, result)=>{
                con.query('ALTER TABLE user AUTO_INCREMENT = 8');
                console.log(result);
            })
        })
        done();
    })
})
