const req = require("express/lib/request");
const data = require('../data/data.inMemory');
const assert = require('assert');
const DataConnection = require('../data/dbConnection');
const jwt = require('jsonwebtoken');

let controller = {
    inputValidation: (req, res, next) => {
        let loginData = req.body;
        try {
            assert(typeof loginData.email == 'string', 'Email must be a string input');
            assert(typeof loginData.password == 'string', 'Password must be a string');
            assert(loginData.email.length > 0, 'Email must be filled');
            assert(loginData.password.length > 0, 'Password must be filled');
            next();
        } catch (error) {
            console.log(error.message);
            const err = {
                status: 400,
                result: error.message
            }
            next(err);
        }
    },

    login: (req, res, next) => {
        const userEmail = req.body.email;
        const userPassWord = req.body.password;

        console.log(`Email ${userEmail} and password ${userPassWord}`);
        let err = null;
        DataConnection.getConnection((error, connect) => {
            connect.query('SELECT * FROM user WHERE emailAdress = ?;', [userEmail], (error, result) => {
                connect.release();
                if (error) {
                    console.log("Error?: ----------------");
                    console.log(error)
                };
                let User = result[0];
                console.log(`User =`);
                console.log(User);
                console.log(`Length of user result = ${result.length}`);
                if (User == undefined) {
                    err = {
                        status: 404,
                        result: "User does not exist"
                    }
                    next(err);
                } else if (User.password != userPassWord) {
                    //Moest volgens TC-101-2 en TC-102-3
                    console.log('Incorrect password')
                    err = {
                        status: 400,
                        result: "Not the right password of this email"
                    }
                    next(err);
                } else {
                    console.log(User);
                    jwt.sign(
                        { id: User.id, emailAdress: User.emailAdress },
                        'process.env.JWT_SECRET', {expiresIn: '50d'}, 
                        //Algoritme is verwijdert
                        function (err, token) {
                            if (err) { console.log(err) } else {
                                User = { ...User, token }
                                User.isActive = convertIntToBoolean(User.isActive);
                                console.log(User);
                                res.status(200).json({
                                    status: 200,
                                    result: User
                                })
                            }

                        }
                    );

                }
            });
        });
    },
    testDateDB: (req, res, next) => {
        //Generate token functionality
        const privateKey = "Jouw moeder noemt mij papa.";
        let token2 = null;
        jwt.sign(
            { UserId: 1 },
            privateKey,
            //Algoritme is verwijdert
            function (err, token) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(token);
                    token2 = token;
                    res.status(200).json({
                        status: 200,
                        result: token2
                    })
                }

            }
        );
    },
}


//Function to generate a token. Has yet to be developed. Currently has a placeholder return value - in process
function generateToken() {
    return "YouHaveAccessToken";
}

function convertIntToBoolean(int) {
    return (int == 1);
}
module.exports = controller;