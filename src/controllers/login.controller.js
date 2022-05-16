const req = require("express/lib/request");
const assert = require('assert');
const DataConnection = require('../data/dbConnection');
const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require("../config/config");
const logr = require('../config/config').logger;
const { callbackify } = require("util");
const { promise } = require("../data/dbConnection");
//Regex for email
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

const BCrypt = require('bcrypt');

let controller = {
    inputValidation: (req, res, next) => {
        let loginData = req.body;
        try {
            let emailIsValid = emailRegex.test(loginData.emailAdress);
            assert(typeof loginData.emailAdress == 'string', 'Email must be a string input');
            assert(typeof loginData.password == 'string', 'Password must be a string');
            assert(emailIsValid, 'Email has the wrong format');
            assert(loginData.password.length > 0, 'Password must be filled');
            next();
        } catch (error) {
            logr.trace(error.message);
            logr.debug(error.message);
            const err = {
                status: 400,
                message: error.message
            }
            next(err);
        }
    },

    login: (req, res, next) => {
        const userEmail = req.body.emailAdress;
        const userPassWord = req.body.password;
        logr.trace(`Email ${userEmail} and input password ${userPassWord}`);
        let err = null;
        DataConnection.getConnection((error, connect) => {
            connect.query('SELECT * FROM user WHERE emailAdress = ?;', [userEmail], (error, result) => {
                connect.release();
                if (error) {
                    logr.trace("Error?: ----------------");
                    logr.trace(error)
                };
                let User = result[0];
                logr.trace(`User =`);
                logr.trace(`Length of user result = ${result.length}`);
                if (!User) {
                    err = {
                        status: 404,
                        message: "User does not exist"
                    }
                    next(err);
                } else {
                    BCrypt.compare(userPassWord, User.password).then((correct) => {
                        if (correct) {
                            logr.trace('Login has succeeded');
                            jwt.sign({ id: User.id, emailAdress: User.emailAdress },
                                jwtSecretKey, { expiresIn: '50d' },
                                function (err, token) {
                                    if (err) {
                                        logr.trace(err)
                                    } else {
                                        User = { ...User, token }
                                        User.isActive = convertIntToBoolean(User.isActive);
                                        User.roles = User.roles.split(",");
                                        delete User.password;
                                        logr.trace(User);
                                        res.status(200).json({
                                            status: 200,
                                            result: User
                                        })
                                    }
                                }
                            );
                        } else {
                            logr.trace('Incorrect password')
                            err = {
                                status: 400,
                                result: "Not the right password of this email"
                            }
                            next(err);
                        }
                    })
                }
                //Hash incomming password
                //Compare input password with the hash

            });
        });
    },
    testDateDB: (req, res, next) => {
        //Generate token functionality
        let password = req.params.password;
        BCrypt.hash(password, 10).then((result) => {
            logr.debug(result);
            BCrypt.compare(password, result).then(resa => {
                logr.debug(resa);
                res.status(200).json({
                    status: 200,
                    result: result
                })
            })

        })



        // jwt.sign(
        //     { UserId: 1 },
        //     privateKey,
        //     //Algoritme is verwijdert
        //     function (err, token) {
        //         if (err) {
        //             logr.trace(err)
        //         } else {
        //             logr.trace(token);
        //             token2 = token;
        //             res.status(200).json({
        //                 status: 200,
        //                 result: token2
        //             })
        //         }

        //     }
        // );
    },
}

const tryPassword = async (password) => {
    return BCrypt.try(password);
}

//Function to generate a token. Has yet to be developed. Currently has a placeholder return value - in process
function generateToken() {
    return "YouHaveAccessToken";
}

function convertIntToBoolean(int) {
    return (int == 1);
}
module.exports = controller;