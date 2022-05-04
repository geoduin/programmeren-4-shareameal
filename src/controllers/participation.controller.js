const req = require("express/lib/request");
const data = require('../data/data.inMemory');
const assert = require('assert');
const DBConnection = require("../data/dbConnection");

let controller = {
    //Assists UC-401 to UC-404 Checks if token is valid.
    tokenValidation: (req, res, next) => {
        if (true) {
            console.log(`toolkMSNASHSJ token is not yet developed.`);
            next();
        } else {
            const error = {
                status: 400,
                result: 'Token is invalid, you cannot sign up.'
            }
            next(error)
        }
    },

    //Assists UC-401, UC-402, UC-403
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

    //Assists UC-402
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
                            result: `Signing user: ${userId}, does not exist in mealId ${mealId}.`
                        }
                        next(err2);
                    }
                })
        })
    }
    ,
    //UC-401
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
                                    const err2 = {
                                        status: 400,
                                        result: 'Already signed up'
                                    }
                                    con.release();
                                    next(err2)
                                } else {
                                    con.release();
                                    res.status(200).json({
                                        status: 200,
                                        result: { mealId: mealId, userId: UserID },
                                        amount: amountParticipants++
                                    })

                                }
                            })
                    } else {
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

    //UC-402
    signOfMeal: (req, res) => {
        const mealId = parseInt(req.params.mealId);
        const userId = parseInt(req.params.userId);
        DBConnection.getConnection((errr, connection) => {
            connection.query('DELETE FROM meal_participants_user WHERE userId = ? AND mealId = ?;', 
            [userId, mealId], (err, results, fields) => {
                console.log(err);
                console.log(results);
                console.log(fields);
                
                
                connection.release();
                res.status(200).json({
                    status: 200,
                    result: `Participation of USERID => ${userId} with MEALID => ${mealId} has been removed.`
                })
            })
        })
    }
    ,
    //UC-403
    getAllParticipants: (req, res) => {
        const mealId = req.params.mealId;
        console.log(`Current ID is ${mealId}`);
        let mealIndex = data.mealData.findIndex((meal) => meal.id = mealId);
        console.log(`Meal index is ${mealIndex}`);
        if (mealIndex != -1) {
            res.status(200).json({
                status: 200,
                result: data.mealData[mealIndex].participants
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Meal does not exist"
            })
        }
    }
    ,
    //UC-404
    getParticipantsDetail: (req, res, next) => {
        const userId = req.params.userId;
        const mealId = req.params.mealId;
        console.log(`Participation details reached ${userId} and mealID ${mealId}`);
        const meal = data.mealData.findIndex((meal) => meal.id == mealId);
        console.log(`Participation details reached, index of meal is ${meal}`);
        let userIndex = data.mealData[meal].participants.findIndex((user) => user.id == userId);
        console.log(`Index reached`);

        if (userIndex != -1) {
            console.log(`Control passed`);
            let userFrom = data.mealData[meal].participants[userIndex];
            const message = {
                status: 200,
                result: userFrom
            }
            next(message);
        } else {
            const message = {
                status: 400,
                result: 'Could not get participant detail'
            }
            next(error);
        }
    }
}

module.exports = controller;