const req = require("express/lib/request");
const assert = require('assert');
const dataSet = require('../data/data.inMemory');
let id = 0;

let controller = {
    //Validate login
    validateLogin:(req, res, next)=>{
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

    //UC-301
    createMeal: (req, res) => {
        //Creates date must be made
        //Update date must be made
        //newMeal attributes name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl,  
        //allergenes, maxAmountOfParticpants, price
        id++;
        let newMeal = req.body.meal;
        let cookId = req.body.user.id;
        //Need a query to collect the participants in a array
        let participants = [];
        newMeal = {
            id, ...newMeal, cookId
        }
        dataSet.mealData.push(newMeal);

        res.status(200).json({
            status: 200,
            result: "Meal added to meal database"
        })
    },

    //UC-302
    updateMealById: (req, res) => {
        //Datetime will be automaticly generated by java code or de database.
        const updatedMeal = req.body.meal;
        const {name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl,
             allergenes, maxAmountOfParticipants, price} = updatedMeal;
        //MealId
        const currentId = req.params.mealId;
        //Search for current meal
        let mealIndex = dataSet.mealData.findIndex((meal) => meal.id == currentId);

        if (mealIndex != -1) {
            //Retrieves meal from database
            dataSet.mealData[mealIndex] = updatedMeal
            //Handelingen verichten om maaltijd  bij te werken

            //Update code
            res.status(200).json({
                status: 200,
                result: 'Update completed'
            })
        } else {
            res.status(400).json({
                status: 404,
                result: "Meal not found"
            })
        }
    },

    //UC-303
    getAllMeals: (req, res) => {
        //Query to collect all meals from database.
        res.status(200).json({
            status: 200,
            result: dataSet.mealData
        })
    },

    //UC-304
    getMealById: (req, res) => {
        const currentId = req.params.mealId;
        //Handelingen verichten om data op te zoeken in de database
        let mealIndex = dataSet.mealData.findIndex((meal) => meal.id == currentId);
        console.log(`Index of meal is: ${mealIndex}`);
        if (mealIndex != -1) {
            //Data fetchen
            res.status(200).json({
                status: 200,
                result: dataSet.mealData[mealIndex]
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Meal retrieval failed"
            })
        }
    },



    //UC-305
    deleteMeal: (req, res) => {
        const currentId = req.params.mealId;
        let mealIndex = dataSet.mealData.findIndex((meal) => meal.mealId == currentId);
        if (mealIndex != -1) {
            //Delete code
            dataSet.mealData.splice(mealIndex, 1);
            res.status(200).json({
                status: 200,
                result: dataSet.mealData[mealIndex]
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Meal does not exist"
            })
        }
    }

}

module.exports = controller;