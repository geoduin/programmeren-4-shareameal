const req = require("express/lib/request");
const assert = require('assert');
const DBConnection = require("../data/dbConnection");
const jwt = require('jsonwebtoken');
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
                    logr.trace('Token we got');
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

module.exports = controller;