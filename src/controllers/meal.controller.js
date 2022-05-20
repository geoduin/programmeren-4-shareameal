const assert = require('assert');
const DB = require('../data/dbConnection');
const DQuery = require('../data/queryList');
const logr = require('../config/config').logger;
const util = require('./general.controller');

let controller = {

    //Inputvalidation
    validateMealCreation: (req, res, next) => {
        logr.trace("Arrived at meal input validation");
        const meal = req.body;
        logr.debug(meal);
        try {
            assert(typeof meal.name == 'string', 'Name must be filled in or a string');
            assert(typeof meal.description == 'string', 'Description must be filled in or a string');
            assert(typeof meal.isActive == 'boolean', 'Must be active or not');
            assert(typeof meal.isVega == 'boolean', 'Must be vega or not');
            assert(typeof meal.isVegan == 'boolean', 'Must be vegan or not');
            assert(typeof meal.isToTakeHome == 'boolean', 'must be a boolean value');
            assert(typeof meal.dateTime == 'string', 'Must be filled in')
            assert(typeof meal.imageUrl == 'string', 'Must have a image url')
            assert(meal.allergenes, 'Allergenes must be filled in or at least a empty array with a empty string.')
            assert(typeof meal.maxAmountOfParticipants == 'number', 'Maximum amount of participants required');
            assert(typeof meal.price == 'number', 'Price is required');
            logr.info("Validation complete");
            next();
        } catch (error) {
            logr.debug(error.message);
            logr.error("Validation failed");
            const err = {
                status: 400,
                message: error.message
            }
            next(err)
        }
    },

    //Assists UC-302 and UC-305 Ownership checking
    checkMealStatus: (req, res, next) => {
        //Receives id from parameter
        logr.trace(req.params.mealId);
        let MealId = parseInt(req.params.mealId);

        //Unloads token 
        const token = util.decodeToken(req.headers.authorization);
        const userId = token.id;
        logr.trace(`Meal ID to be deleted is ${MealId}.`)
        DB.getConnection((err, con) => {
            if (err) { throw err };
            //Search for cookId, based on mealId
            con.query(DQuery.selectCookMealId, [MealId], (error, result, field) => {
                logr.trace('Result is:')
                logr.trace(result);
                try {
                    //Checks if the meal has been found. length = 0, nothing found. Id !=  
                    assert(result.length != 0, 'Meal does not exist');
                    assert(result[0].cookId == userId, 'The user did not own this meal');
                    next();
                } catch (errr) {
                    let err = null;
                    if (errr.message == 'Meal does not exist') {
                        err = { status: 404, message: errr.message }
                    } else {
                        err = { status: 403, message: errr.message }
                    }
                    next(err);
                }
            })
        })
    }
    ,
    //UC-301
    createMeal: (req, res, next) => {
        logr.info("Create meal has started");
        //allergenes, maxAmountOfParticpants, price
        let newMeal = req.body;
        //Decodes token to a readable object {id:(id)}
        const encodedLoad = util.decodeToken(req.headers.authorization);
        let cookId = encodedLoad.id;
        logr.trace(`ID of user is ${cookId}?`);
        //Convert to SQL attributes
        newMeal.isVega = util.convertBooleanToInt(newMeal.isVega);
        newMeal.isVegan = util.convertBooleanToInt(newMeal.isVegan);
        newMeal.isToTakeHome = util.convertBooleanToInt(newMeal.isToTakeHome);
        newMeal.dateTime = util.convertOldDateToMySqlDate(newMeal.dateTime);
        if (newMeal.allergenes) { newMeal.allergenes = newMeal.allergenes.join(); } else { newMeal.allergenes = [""]; }
        DB.getConnection((error, connection) => {
            if (error) { throw error }
            connection.query(DQuery.insertMeal + DQuery.selectLastId,
                [newMeal.name, newMeal.description, newMeal.isVega, newMeal.isVegan,
                newMeal.isToTakeHome, newMeal.dateTime, newMeal.imageUrl, newMeal.allergenes,
                newMeal.maxAmountOfParticipants, newMeal.price, cookId
                ], (error, results, fields) => {
                    if (error) {
                        logr.error("INSERT ging niet goed");
                        next({ status: 499, error: error })
                    } else {
                        logr.trace("Results of the insert");
                        logr.debug(results[1][0].id);
                        let lastINSERTId = results[1][0].id;
                        const selectMealCookPart2 =
                            DQuery.insertParticipation +
                            DQuery.selectMeal +
                            DQuery.selectCookInMeal +
                            DQuery.selectParticipantsOfMeal;
                        let inserts = [lastINSERTId, cookId, lastINSERTId, lastINSERTId, lastINSERTId];
                        connection.query(selectMealCookPart2, (inserts), (err, result, field) => {
                            if (err) { next({ status: 499, error: err.message }) };
                            connection.release();
                            let meal = result[1][0];
                            let cook = result[2][0];
                            let participants = result[3];
                            // logr.trace("INSERT HAS COMPLETED. Meal has been retrieved");
                            meal = util.mealCorrectFormat(meal);
                            cook = util.userCookCorrectFormat(cook);
                            participants.forEach(participant => {
                                delete participant.mealId;
                                delete participant.userId;
                                util.userCookCorrectFormat(participant);
                            })
                            meal.cook = cook;
                            meal.participants = participants;
                            delete meal.cookId;
                            logr.trace('Insert has succeeded');
                            res.status(201).json({
                                status: 201,
                                result: meal,
                            })
                        });
                    };
                });
        });
    }
    ,

    //UC-302 Receives a user and meal object
    updateMealById: (req, res, next) => {
        logr.trace('Update meal has started')
        //Datetime will be automaticly generated by java code or de database.
        let updatedMeal = req.body;
        let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl,
            allergenes, maxAmountOfParticipants, price } = updatedMeal;
        //MealId
        const currentId = parseInt(req.params.mealId);

        isActive = util.convertBooleanToInt(isActive);
        isVega = util.convertBooleanToInt(isVega);
        isVegan = util.convertBooleanToInt(isVegan);
        isToTakeHome = util.convertBooleanToInt(isToTakeHome);
        dateTime = util.convertOldDateToMySqlDate(dateTime);
        logr.trace("Meal ready to be updated");
        if (allergenes) {
            allergenes = allergenes.join();
        } else {
            allergenes = [""];
        }
        let inserts = [name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, currentId];
        //Search for current meal
        DB.getConnection((error, connection) => {
            connection.query(DQuery.updateMeal, inserts, (err, result, fields) => {
                connection.query(DQuery.selectMeal, [currentId], (error, meal, fields) => {
                    connection.release();
                    logr.info("UPDATE has succeeded.");
                    if (err) {
                        logr.debug(err);
                        next({ status: 500, error: err })
                    } else {
                        let Meal = util.mealCorrectFormat(meal[0]);
                        logr.info('Update has succeeded!');
                        res.status(200).json({
                            status: 200,
                            result: Meal
                        })
                    }

                })
            });
        });
    }
    ,
    //UC-303
    getAllMeals: (req, res) => {
        //Query to collect all meals from database.
        logr.info("Retrieve all meals has started");
        const ExecuteTaskQuery = DQuery.selectAllMeals + DQuery.selectAllCooks + DQuery.selectAllParticipants;
        DB.getConnection((error, connect) => {
            connect.query(ExecuteTaskQuery, (err, results) => {
                connect.release();
                let meals = results[0];
                let cookList = results[1];
                let participantsList = results[2];
                for (let cook of cookList) {
                    cook = util.userCookCorrectFormat(cook);
                }
                meals.forEach(meal => {
                    logr.trace(`Current Meal is id ${meal.id}`);
                    let participants = [];
                    meal = util.mealCorrectFormat(meal);
                    for (const cook of cookList) {
                        if (cook.id == meal.cookId) {
                            meal.cook = cook;
                            break;
                        }
                    }
                    for (let participant of participantsList) {
                        if (participant.mealId == meal.id) {
                            logr.debug(`Participant  ${participant.mealId} Pushed to Current Meal is id ${meal.id}`);
                            delete participant.mealId;
                            delete participant.userId;
                            util.userCookCorrectFormat(participant);
                            participants.push(participant);
                        }
                    }
                    delete meal.cookId;
                    meal.participants = participants;
                });
                logr.debug("Retrieval succeeded");
                res.status(200).json({
                    status: 200,
                    amount: meals.length,
                    result: meals
                })
            })
        })
    }
    ,
    //UC-304
    getMealById: (req, res, next) => {
        logr.info("Meal by Id has started");
        const currentId = req.params.mealId;
        let meal = null;
        let participants = null;
        let cook = null;
        let hasMeals = null;
        logr.trace(`Retrieve meal by Id started ${currentId}`)
        DB.getConnection((err, connect) => {
            connect.promise()
                .query(DQuery.selectParticipantsOfAnMeal, [currentId])
                .then(([ParticipantResults]) => {
                    logr.trace('Participants')
                    //Assign participants to participant attribute
                    participants = ParticipantResults;
                }).then(connect
                    .promise()
                    .query(DQuery.selectMeal, [currentId])
                    .then(([mealResult]) => {
                        //Assign meal object to meal
                        logr.trace('Meal=')
                        logr.trace("Retrieval cook has started")
                        meal = mealResult[0];
                        hasMeals = (mealResult.length > 0);
                    }).then(connect
                        .promise()
                        .query(DQuery.selectCookInMeal, [currentId])
                        .then(([cookResult]) => {
                            logr.trace('Cook==')
                            logr.debug(cookResult[0])
                            cook = cookResult[0];
                            if (hasMeals) {
                                logr.trace('Meal found');
                                meal = util.mealCorrectFormat(meal);
                                cook = util.userCookCorrectFormat(cook);
                                delete meal.cookId;
                                delete meal.password;
                                meal.cook = cook;
                                meal.participants = participants;
                                meal.participants.forEach(user => {
                                    util.userCookCorrectFormat(user);
                                })
                                logr.info('Retrieval succeeeded');
                                res.status(200).json({
                                    status: 200,
                                    result: meal
                                })
                            } else {
                                const err = {
                                    status: 404,
                                    message: "Meal does not exist"
                                }
                                next(err);
                            }
                        }).finally(() => {
                            connect.release();
                            logr.info('Einde')
                        })))
        })
    }
    ,
    //UC-305 Delete meal from database
    deleteMeal: (req, res, next) => {
        logr.info(`Meal deletion has started`);
        const currentId = req.params.mealId;
        DB.getConnection((error, connect) => {
            connect.query('DELETE FROM meal WHERE id = ?;', [currentId], (err, result) => {
                connect.release();
                if (result.affectedRows != 0) {
                    //Delete code
                    logr.info('Deletion succeeded.');
                    res.status(200).json({
                        status: 200,
                        message: 'Meal removed'
                    })
                } else {
                    const error = {
                        status: 400,
                        message: "Meal does not exist"
                    }
                    next(error);
                }
            })
        })
    }
}

module.exports = controller;