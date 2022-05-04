const req = require("express/lib/request");
const data = require('../data/data.inMemory');
const assert = require('assert');
const DBConnection = require("../data/dbConnection");

let controller = {
    //Assists UC-401 to UC-404 Checks if token is valid. -authToken {token}
    tokenValidation: (req, res, next) => {
        if (true) {
            console.log(`toolkMSNASHSJ token is not yet developed.`);
            next();
        } else {
            const error = {
                status: 401,
                result: 'Token is invalid, you cannot sign up.'
            }
            next(error)
        }
    },

    //Assists UC-401, UC-402, UC-403 - params {mealId}
    checkExistenceMeal: (req, res, next) => {
        const mealId = req.params.mealId;
        console.log(`MealID to search existence of === ${mealId} ===`);
        DBConnection.getConnection((error, connection) => {
            if (error) { throw error };
            connection.query('SELECT * FROM meal WHERE id = ?;', [mealId], (err, results, fields) => {
                connection.release();
                if (results.length > 0) {
                    console.log(`Meal with ID ${mealId} exists!`)
                    next();
                } else {
                    const err2 = {
                        status: 404,
                        result: 'Meal does not exist!'
                    }
                    next(err2);
                }
            })
        })
    }
    ,

    //Assists UC-402 and UC-404 - params {mealId, userId}
    checkSignUp: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        const mealId = parseInt(req.params.mealId);
        console.log(`SignUpChecker: UserID -> ${userId}, MealId -> ${mealId}.`)
        DBConnection.getConnection((error, connection) => {
            connection.query('SELECT COUNT(*) AS count FROM meal_participants_user WHERE mealId = ? AND userId = ?;',
                [mealId, userId], (err, results, fields) => {
                    connection.release();
                    console.log(results[0].count);
                    if (results[0].count > 0) {
                        console.log(`User with ID ${userId} does exist in meal with ID ${mealId}.`)
                        next();
                    } else {
                        const err2 = {
                            status: 404,
                            result: `Participant with userID: ${userId}, does not exist in meal with mealID: ${mealId}.`
                        }
                        next(err2);
                    }
                })
        })
    }
    ,

    //Assists UC-403 - params {mealId, userId}
    checkOwnerShipMeal: (req, res, next) => {
        const UserID = parseInt(req.body.id);
        const mealId = parseInt(req.params.mealId);

        DBConnection.getConnection((err, con) => {
            con.query('SELECT COUNT(*) AS value FROM meal WHERE id = ? AND cookId = ?;', [mealId, UserID], (error, result) => {
                con.release();
                let aaa = result;
                console.log(`Result of query = ${result[0].value}`);
                if (result[0].value == 0) {
                    const err = {
                        status: 400,
                        result: `Meal ${mealId} is not owned by User: ${UserID}`
                    }
                    next(err);
                } else {
                    console.log(`Meal | ${mealId} | is owned by => User: ${UserID} |`)
                    next();
                }
            })
        })


    }
    ,
    //UC-401 - params {mealId, userId}
    joinMeal: (req, res, next) => {
        const UserID = parseInt(req.params.userId);
        const mealId = parseInt(req.params.mealId);

        console.log(`JOIN MEAL: UserID is = ${UserID}, and MealID = ${mealId}!`);

        DBConnection.getConnection((err, con) => {
            if (err) { throw err };
            con.query('SELECT mealId, COUNT(*) AS participants, maxAmountOfParticipants FROM meal_participants_user JOIN meal on meal.id = meal_participants_user.mealId WHERE mealId = ?;',
                [mealId], (errors, result) => {
                    if (errors) { throw errors };
                    let amountParticipants = result[0].participants;
                    const maxAmountOfParticipants = result[0].maxAmountOfParticipants;
                    console.log(`Amount of particpants of mealID ${mealId} is => ${amountParticipants} and the maximum is ${maxAmountOfParticipants}.`)
                    if (amountParticipants < maxAmountOfParticipants) {
                        con.query('INSERT INTO meal_participants_user VALUES (?,?);',
                            [mealId, UserID], (error, result, fields) => {
                                if (error) {
                                    con.release();
                                    const err2 = {
                                        status: 400,
                                        result: 'Already signed up'
                                    }
                                    next(err2)
                                } else {
                                    con.release();
                                    amountParticipants++;
                                    res.status(200).json({
                                        status: 200,
                                        result: { mealId: mealId, userId: UserID },
                                        amount: amountParticipants
                                    })

                                }
                            })
                    } else {
                        con.release();
                        const err2 = {
                            status: 400,
                            result: 'Maximum amount of participants has been reached.',
                            amount: maxAmountOfParticipants
                        }
                        next(err2)
                    }
                })

        })
    }
    ,

    //UC-402 - params {mealId, userId}
    signOfMeal: (req, res) => {
        const mealId = parseInt(req.params.mealId);
        const userId = parseInt(req.params.userId);
        DBConnection.getConnection((errr, connection) => {
            connection.query('DELETE FROM meal_participants_user WHERE userId = ? AND mealId = ?;',
                [userId, mealId], (err, results, fields) => {
                    connection.release();
                    res.status(200).json({
                        status: 200,
                        result: `Participation of USERID => ${userId} with MEALID => ${mealId} has been removed.`
                    })
                })
        })
    }
    ,
    //UC-403 - params {mealId} And body(object send) {id:(userId)}
    getAllParticipants: (req, res) => {
        const mealId = parseInt(req.params.mealId);
        console.log(`Meal ID => ${mealId}`);
        const userId = req.body.id;
        console.log(`User ID => ${userId}`);

        DBConnection.getConnection((err, con) => {
            con.query('SELECT * FROM user WHERE user.id IN (SELECT userId FROM meal_participants_user WHERE meal_participants_user.mealId = ?);',
                [mealId], (error, userResults, field) => {
                    con.release();
                    userResults.forEach(user => {
                        user.roles = user.roles.split(",");
                    });
                    res.status(200).json({
                        status: 200,
                        amount: userResults.length,
                        result: userResults
                    })
                })
        })


    }
    ,
    //UC-404 - params {mealId, userId} 
    getParticipantsDetail: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        const mealId = parseInt(req.params.mealId);
        console.log(`Participation details reached ${userId} and mealID ${mealId}`);
        DBConnection.getConnection((err, connection) => {
            connection.query('SELECT firstName, lastName, emailAdress, phoneNumber, street, city FROM user WHERE id = ?;', [userId],
                (error, results, fields) => {
                    connection.release();
                    res.status(200).json({
                        status: 200,
                        mealId: mealId,
                        result: results[0]
                    })
                })
        })


    }
}

module.exports = controller;