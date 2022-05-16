const req = require("express/lib/request");
const assert = require('assert');
const DataConnection = require('../data/dbConnection');
const jwt = require('jsonwebtoken');
const { text } = require("express");
const { stringify } = require("querystring");
const logr = require('../config/config').logger;

let controller = {
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
                   logr.trace(err)
                } else {
                    logr.trace(token);
                    token2 = token;
                    res.status(200).json({
                        status: 200,
                        result: token2
                    })
                }

            }
        );
    }
    ,
    validateTokenLogin: (req, res, next) => {
        const auth = req.headers.authorization;
        let token = undefined;
        let load = undefined;
        let expireDate = undefined;
        let currentDate = undefined;
        if (auth) {
            token = auth.substring(7, auth.length);
            logr.trace('Header is')
            logr.trace(token);
            load = jwt.decode(token);
            expireDate = load.exp;
            currentDate = new Date().getTime() / 1000;
        }


        try {
            assert(typeof token == 'string', 'Not logged in');
            //Checks if token is still valid?
            assert(currentDate < expireDate, 'Token has expired');
            next();
        } catch (error) {
            const err = {
                status: 401,
                message: error.message
            }
            next(err);
        }
    }
    ,
    validateToken: (req, res, next) => {
        jwt.sign(
            { id: 999 },
            process.env.JWT_SECRET, { expiresIn: '50d' },
            //Algoritme is verwijdert
            function (err, token) {
                if (err) { logr.trace(err) } else {
                    logr.trace(token);
                    res.status(200).json({
                        status: 200,
                        result: token
                    })
                }
            }
        );


    }
}
module.exports = controller;