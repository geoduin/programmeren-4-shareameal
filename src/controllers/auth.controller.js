const req = require("express/lib/request");
const assert = require('assert');
const DataConnection = require('../data/dbConnection');
const jwt = require('jsonwebtoken');
const { text } = require("express");
const { stringify } = require("querystring");
const logr = require('../config/config').logger;

let controller = {
    validateTokenLogin: (req, res, next) => {
        const auth = req.headers.authorization;
        logr.debug(auth);
        let token = undefined;
        let load = undefined;
        let expireDate = undefined;
        let currentDate = undefined;

        let isValid = true;
        if (auth) {
            token = auth.substring(7, auth.length);
            logr.info('Header is')
            logr.debug(token);
            load = jwt.decode(token);
            logr.debug(load);
            if (load) {
                expireDate = load.exp;
                currentDate = new Date().getTime() / 1000;
                logr.trace(`Id: ${load.id} has been retrieved`)
            } else{
                logr.warn("Token load is false");
                isValid = false;
            }
        }


        try {
            assert(typeof token == 'string', 'Not logged in');
            assert(isValid, 'Token is invalid');
            assert(currentDate < expireDate, 'Token has expired');
            next();
        } catch (error) {
            logr.trace(`Token is not valid`)
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