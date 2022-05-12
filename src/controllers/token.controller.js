const req = require("express/lib/request");
const assert = require('assert');
const dataSet = require('../data/data.inMemory');
const DBConnection = require("../data/dbConnection");
const jwt = require('jsonwebtoken');

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


        // DBConnection.getConnection((err, con) => {
        //     con.query('SELECT * FROM user INNER JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE id IN (SELECT userId FROM meal_participants_user);', (err, resu, fied)=>{
        //         console.log("Length of resultset")
        //         console.log('SELECT COUNT(*) AS answer FROM user INNER JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE id IN (SELECT userId FROM meal_participants_user);');
        //         console.log(resu);
        //         con.release();

        //     })  
        // })
    },
    
}

module.exports = controller;