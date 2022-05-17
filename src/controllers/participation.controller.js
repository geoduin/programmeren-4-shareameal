const req = require("express/lib/request");
const assert = require('assert');
const DBConnection = require("../data/dbConnection");
const jwt = require('jsonwebtoken');
const logr = require('../config/config').logger;

let controller = {
    //Assists UC-401, UC-402, UC-403 - params {mealId}
    checkExistenceMeal: (req, res, next) => {
        const mealId = parseInt(req.params.mealId);
        logr.trace(`MealID to search existence of === ${mealId} ===`);
        DBConnection.getConnection((error, connection) => {
            if (error) { throw error };
            connection.query('SELECT * FROM meal WHERE id = ?;', [mealId], (err, results, fields) => {
                connection.release();
                if (results.length > 0) {
                    logr.trace(`Meal with ID ${mealId} exists!`)
                    next();
                } else {
                    const err2 = {
                        status: 404,
                        message: 'Meal does not exist!'
                    }
                    next(err2);
                }
            });
        });
    }
    ,

    //Assists UC-402 and UC-404 - params {mealId, userId}
    checkSignUp: (req, res, next) => {
        //Unloads header
        const TokenLoad = decodeToken(req.headers.authorization);
        //UserId
        let userId = TokenLoad.id;
        if(req.params.userId){
            userId = req.params.userId;
        }
        //MealId from path parameter
        const mealId = parseInt(req.params.mealId);
        logr.trace(`SignUpChecker: UserID -> ${userId}, MealId -> ${mealId}.`)
        DBConnection.getConnection((error, connection) => {
            connection.query('SELECT COUNT(*) AS count FROM meal_participants_user WHERE mealId = ? AND userId = ?;',
                [mealId, userId], (err, results, fields) => {
                    connection.release();
                    logr.trace(results[0].count);
                    if (results[0].count > 0) {
                        logr.trace(`User with ID ${userId} does exist in meal with ID ${mealId}.`)
                        next();
                    } else {
                        const err2 = {
                            status: 404,
                            message: `Participant with userID: ${userId}, does not exist in meal with mealID: ${mealId}.`
                        }
                        next(err2);
                    }
                })
        });
    }
    ,

    //Assists UC-403 - params {mealId, userId}
    checkOwnerShipMeal: (req, res, next) => {
        
        const TokenLoad = decodeToken(req.headers.authorization);
        const mealId = parseInt(req.params.mealId);
        const UserID = TokenLoad.id;

        logr.trace(mealId);
        logr.trace(UserID);
        DBConnection.getConnection((err, con) => {
            con.query('SELECT COUNT(*) AS value FROM meal WHERE id = ? AND cookId = ?;', [mealId, UserID], (error, result) => {
                con.release();
                let aaa = result;
                logr.trace(`Result of query = ${result[0].value}`);
                if (result[0].value == 0) {
                    const err = {
                        status: 400,
                        message: `Meal ${mealId} is not owned by User: ${UserID}`
                    }
                    next(err);
                } else {
                    logr.trace(`Meal | ${mealId} | is owned by => User: ${UserID} |`)
                    next();
                }
            })
        })


    }
    ,
    //UC-401 - params {mealId, userId}
    joinMeal: (req, res, next) => {
        
        const auth = req.headers.authorization;
        const load = decodeToken(auth);
        const mealId = parseInt(req.params.mealId);
    	const UserID = load.id;
        logr.trace(`JOIN MEAL: UserID is = ${UserID}, and MealID = ${mealId}!`);

        DBConnection.getConnection((err, con) => {
            if (err) { throw err };
            con.query('SELECT id, maxAmountOfParticipants, COUNT(mealId) as participants'+
            ' FROM (SELECT id, maxAmountOfParticipants FROM meal)AS meals'+
            ' LEFT JOIN meal_participants_user ON meal_participants_user.mealId = meals.id GROUP BY id having id = ?;',
                [mealId], (errors, result) => {
                    if (errors) { throw errors };
                    //Amount of participants;
                    let amountParticipants = result[0].participants;
                    //The max amount of participants of the meal.
                    const maxAmountOfParticipants = result[0].maxAmountOfParticipants;
                    logr.trace(`Amount of particpants of mealID ${mealId} is => ${amountParticipants} and the maximum is ${maxAmountOfParticipants}.`)
                    //If the current amount of participants is lower than the limit, it will let the user join the meal
                    if (amountParticipants < maxAmountOfParticipants) {
                        con.query('INSERT INTO meal_participants_user VALUES (?,?);',
                            [mealId, UserID], (error, result, fields) => {
                                //FK/PK error message
                                if (error) {
                                    con.release();
                                    const err2 = {
                                        status: 400,
                                        message: 'Already signed up',
                                        currentlyParticipating: true
                                    }
                                    next(err2)
                                } else {
                                    con.release();
                                    amountParticipants++;
                                    res.status(200).json({
                                        status: 200,
                                        result: {
                                            amount: amountParticipants,
                                            currentlyParticipating: true,
                                            mealId: mealId,
                                            userId: UserID
                                        },
                                    })

                                }
                            })
                    } else {
                        con.release();
                        const err2 = {
                            status: 400,
                            message: 'Maximum amount of participants has been reached.',
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
        //Unloads header
        const TokenLoad = decodeToken(req.headers.authorization);
        const mealId = parseInt(req.params.mealId);
        const userId = TokenLoad.id;
        DBConnection.getConnection((errr, connection) => {
            connection.query('DELETE FROM meal_participants_user WHERE userId = ? AND mealId = ?;',
                [userId, mealId], (err, results, fields) => {
                    connection.release();
                    res.status(200).json({
                        status: 200,
                        result: {
                            message: `Participation of USERID => ${userId} with MEALID => ${mealId} has been removed.`,
                            currentlyParticipating: false
                        }

                    })
                })
        })
    }
    ,
    //UC-403 - params {mealId} And body(object send) {id:(userId)}
    getAllParticipants: (req, res) => {
        const mealId = parseInt(req.params.mealId);
        logr.trace(`Meal ID => ${mealId}`);
        const userId = req.body.id;
        logr.trace(`User ID => ${userId}`);

        DBConnection.getConnection((err, con) => {
            con.query('SELECT firstName, lastName, emailAdress, phoneNumber, street, city, roles FROM user WHERE user.id IN (SELECT userId FROM meal_participants_user WHERE meal_participants_user.mealId = ?);',
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
        logr.trace(`Participation details reached ${userId} and mealID ${mealId}`);
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

function decodeToken(headerBearer) {
    const token = headerBearer.substring(7, headerBearer.length);
    return jwt.decode(token);
}

module.exports = controller;