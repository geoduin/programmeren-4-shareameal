const req = require("express/lib/request");
const assert = require('assert');
const dataSet = require('../data/data.inMemory');
let id = 0;
const DB = require('../data/dbConnection');

let controller = {
    //Validate login
    validateLogin: (req, res, next) => {
        try {
            let user = req.body.user;
            console.log(user);
            assert(typeof user == 'object', 'Must send a user or login required');
            next();
        } catch (error) {
            const err = {
                status: 401,
                result: error.message
            }
            next(err);
        }
    },

    //Validate token
    validateToken: (req, res, next) => {
        //Validates toke
        try {

        } catch (error) {
            const err = {
                status: 400,
                result: error.message
            }
        }
        next();
    },
    //Inputvalidation
    validateMealCreation: (req, res, next) => {
        const meal = req.body.meal;
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
                result: error.message
            }
            next(err)
        }
    },

    //Ownership checking
    checkMealStatus: (req, res, next) => {
        console.log(req.params.mealId);
        let id = parseInt(req.params.mealId);
        DB.getConnection((err, con) => {
            if (err) { throw err };
            con.query('SELECT cookId FROM meal WHERE id = ?;', [id], (error, result, field) => {
                console.log('Result is:')
                console.log(result);
                try {
                    assert(result.length != 0, 'Meal does not exist');
                    assert(result[0].cookId == req.body.user.id, 'The user did not own this meal');
                    next();
                } catch (errr) {
                    let err = null;
                    if (errr.message == 'Meal does not exist') {
                        err = {
                            status: 404,
                            result: errr.message
                        }
                    } else {
                        err = {
                            status: 401,
                            result: errr.message
                        }
                    }
                    next(err);
                }
            })
        })
    }
    ,
    //UC-301
    createMeal: (req, res) => {
        let query = 'INSERT INTO meal (cookId, name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price)VALUES(?,?,?,?,?,?,?,?,?,?,?);';
        //newMeal attributes name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl,  
        //allergenes, maxAmountOfParticpants, price
        let newMeal = req.body.meal;
        let cookId = req.body.user.id;
        console.log(`newMeal is ----------------------------------------------`);
        console.log(newMeal);
        console.log(`cookId is----------------------------------------------------`);
        console.log(cookId);

        //Convert to SQL attributes
        newMeal.isActive = convertBooleanToInt(newMeal.isActive);
        newMeal.isVega = convertBooleanToInt(newMeal.isVega);
        newMeal.isVegan = convertBooleanToInt(newMeal.isVegan);
        newMeal.isToTakeHome = convertBooleanToInt(newMeal.isToTakeHome);
        console.log(`newMeal after convertion ----------------------------------------------`);
        newMeal.allergenes = newMeal.allergenes.join();
        console.log(newMeal);


        DB.getConnection((error, connection) => {
            if (error) { throw error }
            connection.query('INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newMeal.name, newMeal.description, newMeal.isActive, newMeal.isVega, newMeal.isVegan,
                newMeal.isToTakeHome, newMeal.dateTime, newMeal.imageUrl, newMeal.allergenes,
                newMeal.maxAmountOfParticipants, newMeal.price, cookId], (error, results, fields) => {
                    connection.query('SELECT * FROM meal ORDER BY createDate DESC LIMIT 1;', (err, result, field) => {
                        connection.release();
                        let meal = result[0];
                        console.log('Insert has succeeded');
                        res.status(201).json({
                            status: 201,
                            results: 'Meal has been added to the database',
                            meal: meal
                        })
                    });


                });
        });
    },

    //UC-302 Receives a user and meal object
    updateMealById: (req, res) => {
        console.log('Update has started')
        //Datetime will be automaticly generated by java code or de database.
        let updatedMeal = req.body.meal;
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
                    connection.release();
                    if (err) { throw err };
                    console.log('Affected rows  ====V====')
                    console.log('Update has succeeded!');
                    res.status(200).json({
                        status: 200,
                        result: 'Update completed'
                    })

                });
        });
    },

    //UC-303
    getAllMeals: (req, res) => {
        //Query to collect all meals from database.
        let meals = null;
        let mealOne = null;
        DB.getConnection((error, connection) => {
            if (error) { throw error };
            const query = "SELECT meal.id, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.createDate, meal.updateDate, meal.name, meal.description, meal.allergenes, JSON_OBJECT('id', meal.cookId, 'firstName', user.firstName, 'lastName', user.lastName, 'isActive', user.isActive, 'emailAdress', user.emailAdress, 'roles', user.roles, 'phoneNumber', user.phoneNumber, 'city', user.city, 'street', user.street) AS cook FROM meal JOIN user ON user.id = meal.cookId;"
            connection.promise()
                .query(query)
                .then(([rows]) => {
                    mealOne = rows;
                }).then(connection.promise()
                    .query('SELECT * FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE id IN (SELECT userId FROM meal_participants_user);')
                    .then(([result, fields]) => {
                        console.log(`Length of result: ${result}`)
                        console.log(result);
                        connection.release();
                        for (const element of mealOne) {
                            let meal = element;
                            let participants = [];
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
                                console.log(user.mealId);
                                if (user.mealId == meal.id) {
                                    console.log(`Meal with id ${meal.id} got user with mealId: ${user.mealId}`);
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
                )
        })


    },

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
                    console.log('Participants')
                    console.log(ParticipantResults);
                    //Assign participants to participant attribute
                    participants = ParticipantResults;
                    participants.forEach(user => {
                        user.roles = user.roles.split(",");
                        user.isActive = (user.isActive == 1);
                    });
                }).then(connect
                    .promise()
                    .query('SELECT * FROM meal WHERE id = ?;', [currentId])
                    .then(([mealResult]) => {
                        console.log('Meal=')
                        console.log(mealResult);
                        //Assign meal object to meal
                        meal = mealResult[0];
                        hasMeals = (mealResult.length > 0);
                    }).then(connect
                        .promise()
                        .query('SELECT * FROM user WHERE id IN (SELECT cookId FROM meal WHERE id = ?);', [currentId])
                        .then(([cookResult]) => {
                            console.log('Cook==')
                            console.log(cookResult[0])
                            cook = cookResult[0];
                            if (hasMeals) {
                                meal.isActive = (meal.isActive == 1);
                                meal.isVega = (meal.isVega == 1);
                                meal.isVegan = (meal.isVegan == 1);
                                meal.isToTakeHome = (meal.isToTakeHome == 1);
                                meal.allergenes = meal.allergenes.split(",");
                                cook.roles = cook.roles.split(",");
                                cook.isActive = (cook.isActive == 1);
                                delete meal.cookId;
                                meal.cook = cook;
                                meal.participants = participants;
                                res.status(200).json({
                                    status: 200,
                                    result: meal
                                })
                            } else {
                                const err = {
                                    status: 404,
                                    result: "Meal does not exist"
                                }
                                next(err);
                            }
                        }).finally(() => {
                            connect.release();
                            console.log('Einde')
                        })))
        })

    },



    //UC-305
    deleteMeal: (req, res) => {
        const currentId = req.params.mealId;
        console.log(`Id of meal is ${currentId}`);
        DB.getConnection((error, connect) => {
            connect.query('DELETE FROM meal WHERE id = ?;', [currentId], (err, result) => {
                connect.release();
                if (result.affectedRows != 0) {
                    //Delete code
                    res.status(200).json({
                        status: 200,
                        result: 'Meal removed'
                    })
                } else {
                    res.status(400).json({
                        status: 400,
                        result: "Meal does not exist"
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