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
            logr.debug(error.message);
            const err = {
                status: 400,
                message: error.message
            }
            next(err);
        }
    },

    login: (req, res, next) => {
        logr.info("Login has started");
        const userEmail = req.body.emailAdress;
        const userPassWord = req.body.password;
        let err = null;
        DataConnection.getConnection((error, connect) => {
            connect.query('SELECT * FROM user WHERE emailAdress = ?;', [userEmail], (error, result) => {
                connect.release();
                if (error) {
                    logr.debug("Error?: ----------------");
                    logr.warn(error)
                };
                let User = result[0];
                logr.debug(`Length of user result = ${result.length}`);
                if (!User) {
                    err = {
                        status: 404,
                        message: "User does not exist"
                    }
                    next(err);
                } else {
                    BCrypt.compare(userPassWord, User.password).then((isCorrect) => {
                        if (isCorrect) {
                            jwt.sign({ id: User.id, emailAdress: User.emailAdress },
                                jwtSecretKey, { expiresIn: '50d' },
                                function (err, token) {
                                    if (err) {
                                        logr.trace(err)
                                        next({ status: 400, error: err.message });
                                    } else {
                                        User = { ...User, token }
                                        User.isActive = convertIntToBoolean(User.isActive);
                                        User.roles = User.roles.split(",");
                                        delete User.password;
                                        logr.debug(User);
                                        res.status(200).json({
                                            status: 200,
                                            result: User
                                        })
                                    }
                                }
                            );
                        } else {
                            logr.error('Incorrect password')
                            err = {
                                status: 400,
                                message: "Not the right password of this email"
                            }
                            next(err);
                        }
                    })
                }
            });
        });
    },
}

function convertIntToBoolean(int) {
    return (int == 1);
}
module.exports = controller;