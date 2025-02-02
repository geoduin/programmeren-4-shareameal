const DBConnection = require("../data/dbConnection");
const logr = require('../config/config').logger;
const DQuery = require('../data/queryList');
const util = require('./general.controller');

let controller = {
    //Assists UC-401, UC-402, UC-403 - params {mealId}
    checkExistenceMeal: (req, res, next) => {
        const mealId = parseInt(req.params.mealId);
        logr.trace(`MealID to search existence of === ${mealId} ===`);
        DBConnection.getConnection((error, connection) => {
            if (error) { throw error };
            connection.query(DQuery.selectMeal, [mealId], (err, results, fields) => {
                connection.release();
                if (results.length > 0) {
                    logr.debug(`Meal with ID ${mealId} exists!`)
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

    //Assists UC-404 - params {mealId, userId}
    checkSignUp: (req, res, next) => {
        //Unloads header
        const TokenLoad = util.decodeToken(req.headers.authorization);
        //UserId
        let userId = TokenLoad.id;
        if (req.params.userId) { userId = req.params.userId;}
        //MealId from path parameter
        const mealId = parseInt(req.params.mealId);
        logr.debug(`SignUpChecker: UserID -> ${userId}, MealId -> ${mealId}.`)
        DBConnection.getConnection((error, connection) => {
            connection.query(DQuery.selectSignUp,
                [mealId, userId], (err, results, fields) => {
                    connection.release();
                    logr.trace(results[0].count);
                    if (results[0].count > 0) {
                        logr.debug(`User with ID ${userId} does exist in meal with ID ${mealId}.`)
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
        const TokenLoad = util.decodeToken(req.headers.authorization);
        const mealId = parseInt(req.params.mealId);
        const UserID = TokenLoad.id;
        DBConnection.getConnection((err, con) => {
            if(err){next({status: 499, error: err.message})};
            con.query('SELECT COUNT(*) AS value FROM meal WHERE id = ? AND cookId = ?;', [mealId, UserID], (error, result) => {
                con.release();
                let aaa = result;
                logr.debug(`Result of query = ${result[0].value}`);
                if (result[0].value == 0) {
                    const err = {
                        status: 400,
                        message: `Meal ${mealId} is not owned by User: ${UserID}`
                    }
                    next(err);
                } else {
                    logr.info(`Meal | ${mealId} | is owned by => User: ${UserID} |`)
                    next();
                }
            })
        })


    }
    ,
    //UC-401 and UC-402- params {mealId, userId}
    participateLeaveMeal: (req, res, next) => {
        logr.info("(de)assign from meal");
        const load = util.decodeToken(req.headers.authorization);
        const mealId = parseInt(req.params.mealId);
        const UserID = load.id;
        logr.debug(`JOIN MEAL: UserID is = ${UserID}, and MealID = ${mealId}!`);
        const amountPartQuery = DQuery.selectAmountOfParticipantsOfMeal;
        DBConnection.getConnection((err, con) => {
            if (err) { throw err };
            //Checks if amount has been met.
            con.query(amountPartQuery, [mealId], (errors, result) => {
                if (errors) { throw errors };
                let amountParticipants = result.length;
                let participantList = result;
                const maxAmountOfParticipants = result[0].maxAmountOfParticipants;
                logr.trace(`Amount of particpants of mealID ${mealId} is => ${amountParticipants} and the maximum is ${maxAmountOfParticipants}.`)
                //If the current amount of participants is lower than the limit, it will let the user join the meal
                let ParticipantIsThere = participantList.filter((user) => user.userId == UserID);
                if (amountParticipants < maxAmountOfParticipants || ParticipantIsThere.length > 0) {
                    con.query(DQuery.insertParticipation, [mealId, UserID], (error, result, fields) => {
                        //FK/PK error message
                        if (error) {
                            logr.error(error.message);
                            logr.info("User exits meal");
                            con.query(DQuery.deleteParticipation, [mealId, UserID], (fail, succes) => {
                                con.release();
                                res.status(200).json({
                                    status: 200,
                                    result: {
                                        message: `Participation of USERID => ${UserID} with MEALID => ${mealId} has been removed.`,
                                        currentlyParticipating: false
                                    }
                                })
                            })
                        } else {
                            logr.info("User enters meal");
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
        logr.info(`Participation details reached ${userId} and mealID ${mealId}`);
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