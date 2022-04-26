const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../integration/user');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('UC-201 Manage movies POST /api/user',()=>{
    describe('UC-201 Add movies', ()=>{
        beforeEach(()=>{
            database = [];
            done();
        });

        it('TC When required input is missing, a valid error should be returned', (done)=>{
            chai.request(server).post('/api/user').send({
                //FirstName ontbreekt
                firstName: 111,
                lastName: "Arezo",
                city: "Montevideo",
                street: "Straat",
                email: "DoaeM@outlook.com",
                password: "MontevideoFC",
                isActive: true,
                phoneNumber: "1233455677"
            }).end((err, res)=>{
                res.should.be.an('object');
                let {status, result}= res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('Foutmelding: Title must be a string');
                done();
            })  
            
        })

        //it('TC-201 When a required inut is missing, a valid error should be'){}
    })
});