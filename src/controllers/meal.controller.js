const req = require("express/lib/request");
const dataSet = require('../data/data.inMemory');
let id = 0;

let controller = {

    //UC-301
    createMeal: (req, res) => {
        let newMeal = req.body;
        id++;
        newMeal = {
            id, ...newMeal
        }
        dataSet.mealData.push(newMeal);

        res.status(200).json({
            status: 200,
            result: "Meal added to meal database"
        })
    },

    //UC-302
    getAllMeals: (req, res) => {
        res.status(200).json({
            status: 200,
            result: dataSet.mealData
        })
    },

    //UC-303
    getMealById: (req, res) => {
        const currentId = req.params.mealId;
        let mealIndex = dataSet.mealData.findIndex((meal) => meal.mealId == currentId);

        if (mealIndex != -1) {
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

    //UC-304
    updateMealById: (req, res) => {
        const currentId = req.params.mealId;
        let mealIndex = dataSet.mealData.findIndex((meal) => meal.mealId == currentId);
        if (mealIndex != -1) {
            //Update code
            res.status(200).json({
                status: 200,
                result: dataSet.mealData[mealIndex]
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Meal update failed"
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
                result: "Meal update failed"
            })
        }
    }

}

module.exports = controller;