const req = require("express/lib/request");
const assert = require('assert');
const DB = require('../data/dbConnection');
const jwt = require('jsonwebtoken');
const { query } = require("../data/dbConnection");
const logr = require('../config/config').logger;
let controller = {

    //Inputvalidation
    validateMealCreation: (req, res, next) => {
        const meal = req.body;
        let name = meal.name;
        let description = meal.description;
        let isActive = meal.isActive;
        let isVega = meal.isVega;
        let isVegan = meal.isVegan;
        let isToTakeHome = meal.isToTakeHome;
        let dateTime = meal.dateTime;
        let imageUrl = meal.imageUrl;
        //Allergene list is in process
        let maxAmountOfParticipants = meal.maxAmountOfParticipants;
        let price = meal.price;
        try {
            assert(typeof name == 'string', 'Name must be filled in or a string');
            assert(typeof description == 'string', 'Description must be filled in or a string');
            assert(typeof isActive == 'boolean', 'Must be active or not');
            assert(typeof isVega == 'boolean', 'Must be vega or not');
            assert(typeof isVegan == 'boolean', 'Must be vegan or not');
            assert(typeof isToTakeHome == 'boolean', 'must be a boolean value');
            assert(typeof dateTime == 'string', 'Must be filled in')
            assert(typeof imageUrl == 'string', 'Must have a image url')
            //assert(typeof allergenes == '')
            assert(typeof maxAmountOfParticipants == 'number', 'Maximum amount of participants required');
            assert(typeof price == 'number', 'Price is required');
            next();
        } catch (error) {
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
        const auth = req.headers.authorization;
        const token = auth.substring(7, auth.length);
        const userId = jwt.decode(token).id;
        logr.trace(`Meal ID to be deleted is ${MealId}.`)
        DB.getConnection((err, con) => {
            if (err) { throw err };
            //Search for cookId, based on mealId
            con.query('SELECT cookId FROM meal WHERE id = ?;', [MealId], (error, result, field) => {
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
                        err = { status: 401, message: errr.message }
                    }
                    next(err);
                }
            })
        })
    }
    ,
    //UC-301
    createMeal: (req, res) => {
        //newMeal attributes name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl,  
        //allergenes, maxAmountOfParticpants, price
        let newMeal = req.body;

        //Receives payload from authorization with the token
        const auth = req.headers.authorization;
        const token = auth.substring(7, auth.length);
        //Decodes token to a readable object {id:(id), emailAdress:(emailAdress)}
        const encodedLoad = jwt.decode(token);
        let cookId = encodedLoad.id;

        logr.trace(`newMeal is ----------------------------------------------`);
        logr.trace(newMeal);
        logr.trace(`cookId is ${cookId}`);

        //Convert to SQL attributes
        newMeal.isVega = convertBooleanToInt(newMeal.isVega);
        newMeal.isVegan = convertBooleanToInt(newMeal.isVegan);
        newMeal.isToTakeHome = convertBooleanToInt(newMeal.isToTakeHome);
        logr.trace(`newMeal after convertion ----------------------------------------------`);
        newMeal.allergenes = newMeal.allergenes.join();
        logr.trace(newMeal);

        DB.getConnection((error, connection) => {
            if (error) { throw error }
            connection.query('INSERT INTO meal (name, description, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newMeal.name, newMeal.description, newMeal.isVega, newMeal.isVegan,
                newMeal.isToTakeHome, newMeal.dateTime, newMeal.imageUrl, newMeal.allergenes,
                newMeal.maxAmountOfParticipants, newMeal.price, cookId], (error, results, fields) => {
                    connection.query('SELECT * FROM meal ORDER BY createDate DESC LIMIT 1;', (err, result, field) => {
                        connection.release();
                        let meal = result[0];

                        meal.isVega = intToBoolean(meal.isVega);
                        meal.isVegan = intToBoolean(meal.isVegan);
                        meal.isToTakeHome = intToBoolean(meal.isToTakeHome);
                        meal.isActive = intToBoolean(meal.isActive);

                        logr.trace('Insert has succeeded');
                        res.status(201).json({
                            status: 201,
                            result: meal,
                        })
                    });


                });
        });
    }
    ,

    //UC-302 Receives a user and meal object
    updateMealById: (req, res) => {
        logr.trace('Update has started')
        //Datetime will be automaticly generated by java code or de database.
        let updatedMeal = req.body;
        let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl,
            allergenes, maxAmountOfParticipants, price } = updatedMeal;
        //MealId
        const currentId = parseInt(req.params.mealId);

        isActive = convertBooleanToInt(isActive);
        isVega = convertBooleanToInt(isVega);
        isVegan = convertBooleanToInt(isVegan);
        isToTakeHome = convertBooleanToInt(isToTakeHome);
        allergenes = allergenes.join();
        //Search for current meal
        DB.getConnection((error, connection) => {
            connection.query('UPDATE meal SET name = "?",description = ?, isActive = ?,isVega = ?,isVegan = ?,isToTakeHome = ?,dateTime = ?,imageUrl = ?,allergenes = ?,maxAmountOfParticipants = ?, price = ? WHERE id = ?;',
                [name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, currentId],
                (err, result, fields) => {
                    connection.query('SELECT * FROM meal WHERE id = ?;', [currentId], (error, meal, fields) => {
                        connection.release();
                        if (err) { throw err };
                        let Meal = meal[0];
                        Meal.isActive = intToBoolean(Meal.isActive);
                        Meal.isToTakeHome = intToBoolean(Meal.isToTakeHome);
                        Meal.isVega = intToBoolean(Meal.isVega);
                        Meal.isVegan = intToBoolean(Meal.isVegan);
                        Meal.allergenes = Meal.allergenes.split(",");
                        logr.trace('Affected rows  ====V====')
                        logr.trace('Update has succeeded!');
                        res.status(200).json({
                            status: 200,
                            result: meal[0]
                        })
                    })
                });
        });
    }
    ,
    //UC-303
    getAllMeals: (req, res) => {
        //Query to collect all meals from database.
        let meals = null;
        let mealOne = null;
        const queries = "SELECT meal.id, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.createDate, meal.updateDate, meal.name, meal.description, meal.allergenes, JSON_OBJECT('id', meal.cookId, 'firstName', user.firstName, 'lastName', user.lastName, 'isActive', user.isActive, 'emailAdress', user.emailAdress, 'roles', user.roles, 'phoneNumber', user.phoneNumber, 'city', user.city, 'street', user.street) AS cook FROM meal JOIN user ON user.id = meal.cookId;";
        DB.getConnection((error, connection) => {
            if (error) { throw error };
            connection.query(queries, (error, rows) => {
                mealOne = rows;
                connection.query('SELECT * FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE id IN (SELECT userId FROM meal_participants_user);', (er, result) => {
                    logr.trace(`Length of result: ${result}`)
                    logr.trace(result);
                    connection.release();
                    for (const element of mealOne) {
                        let meal = element;
                        let participants = [];
                        logr.debug(meal.cook);
                        meal.cook = JSON.parse(meal.cook);
                        meal.cook.isActive = intToBoolean(meal.cook.isActive);
                        meal.cook.roles = meal.cook.roles.split(",");
                        meal.isActive = intToBoolean(meal.isActive);
                        meal.isToTakeHome = intToBoolean(meal.isToTakeHome);
                        meal.isVega = intToBoolean(meal.isVega);
                        meal.isVegan = intToBoolean(meal.isVegan);
                        if (meal.allergenes != null) {
                            if (meal.allergenes.length > 0) {
                                meal.allergenes = meal.allergenes.split(",");
                            }
                        }
                        result.forEach(user => {
                            logr.trace(user.mealId);
                            if (user.mealId == meal.id) {
                                logr.trace(`Meal with id ${meal.id} got user with mealId: ${user.mealId}`);
                                user.isActive = intToBoolean(user.isActive);
                                delete user.mealId;
                                delete user.userId;
                                delete user.password;
                                participants.push(user);
                            }
                        });
                        meal.participants = participants;
                    }
                    res.status(200).json({
                        status: 200,
                        amount: mealOne.length,
                        result: mealOne
                    })
                })
            })
        })
        // DB.getConnection((error, connection) => {
        //     if (error) { throw error };

        //     connection.promise()
        //         .query(query)
        //         .then(([rows]) => {

        //         }).then(connection.promise()
        //             .query('SELECT * FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE id IN (SELECT userId FROM meal_participants_user);')
        //             .then(([result, fields]) => {

        //             })
        //         )
        // })
    }
    ,
    //UC-304
    getMealById: (req, res, next) => {
        const currentId = parseInt(req.params.mealId);
        let meal = null;
        let participants = null;
        let cook = null;
        let hasMeals = null;
        DB.getConnection((err, connect) => {
            connect.promise()
                .query('SELECT * FROM user WHERE id IN (SELECT userId FROM meal_participants_user WHERE mealId = ?);', [currentId])
                .then(([ParticipantResults]) => {
                    logr.trace('Participants')
                    logr.trace(ParticipantResults);
                    //Assign participants to participant attribute
                    participants = ParticipantResults;
                }).then(connect
                    .promise()
                    .query('SELECT * FROM meal WHERE id = ?;', [currentId])
                    .then(([mealResult]) => {
                        //Assign meal object to meal
                        logr.trace('Meal=')
                        meal = mealResult[0];
                        hasMeals = (mealResult.length > 0);
                    }).then(connect
                        .promise()
                        .query('SELECT * FROM user WHERE id IN (SELECT cookId FROM meal WHERE id = ?);', [currentId])
                        .then(([cookResult]) => {
                            logr.trace('Cook==')
                            logr.trace(cookResult[0])
                            cook = cookResult[0];
                            if (hasMeals) {
                                meal.isActive = (meal.isActive == 1);
                                meal.isVega = (meal.isVega == 1);
                                meal.isVegan = (meal.isVegan == 1);
                                meal.isToTakeHome = (meal.isToTakeHome == 1);
                                meal.allergenes = meal.allergenes.split(",");
                                cook.roles = cook.roles.split(",");
                                cook.isActive = (cook.isActive == 1);
                                delete cook.password;
                                delete meal.cookId;
                                delete meal.password;
                                meal.cook = cook;
                                meal.participants = participants;
                                meal.participants.forEach(user => {
                                    user.roles = user.roles.split(",");
                                    user.isActive = (user.isActive == 1);
                                    delete user.password;
                                })
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
                            logr.trace('Einde')
                        })))
        })

    }
    ,
    //UC-305 Delete meal from database
    deleteMeal: (req, res) => {
        const currentId = req.params.mealId;
        logr.trace(`Id of meal is ${currentId}`);
        DB.getConnection((error, connect) => {
            connect.query('DELETE FROM meal WHERE id = ?;', [currentId], (err, result) => {
                connect.release();
                if (result.affectedRows != 0) {
                    //Delete code
                    res.status(200).json({
                        status: 200,
                        message: 'Meal removed'
                    })
                } else {
                    res.status(400).json({
                        status: 400,
                        message: "Meal does not exist"
                    })
                }
            })
        })
    }
}
function convertBooleanToInt(booleanV) {
    if (booleanV) {
        return 1;
    }
    return 0;
}

function intToBoolean(int) {
    return (int == 1);
}

module.exports = controller;