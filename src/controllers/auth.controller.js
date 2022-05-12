const req = require("express/lib/request");
const data = require('../data/data.inMemory');
const assert = require('assert');
const DataConnection = require('../data/dbConnection');
const jwt = require('jsonwebtoken');
const { text } = require("express");
const { stringify } = require("querystring");

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
    validateTokenLogin2: (req, res, next) => {
        const token = req.headers.authorization.substring(7, req.headers.authorization.length);
        console.log('Header is')
        console.log(token);
        let load = jwt.decode(token);
        let expireDate = load.exp;
        let currentDate = new Date().getTime() / 1000;
        try {
            assert(typeof token == 'string', 'Token must be string');
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
    validateTokenLogin: (req, res, next) => {
        const auth = req.headers.authorization;
        let token = undefined;
        let load = undefined;
        let expireDate = undefined;
        let currentDate = undefined;
        if (auth) {
            token = auth.substring(7, auth.length);
            console.log('Header is')
            console.log(token);
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
            { id: 200, emailAdress: "Jessie@hotmail.com" },
            process.env.JWT_SECRET, { expiresIn: '50d' },
            //Algoritme is verwijdert
            function (err, token) {
                if (err) { console.log(err) } else {
                    console.log(token);
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