const req = require("express/lib/request");
const data = require('../data/data.inMemory');
const assert = require('assert');

let controller = {
    //UC-401
    joinMeal: (req, res) => {
        const currentId = req.params.mealId;
        console.log(`Current ID is ${currentId}`);
        let mealIndex = data.mealData.findIndex((meal) => meal.mealId == currentId);
        if (mealIndex != -1) {
            //Participation code
            let meal = data.mealData[mealIndex]
            //Code to participate has not been implemented

            res.status(200).json({
                status: 200,
                result: "Participation completed"
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Participation failed"
            })
        }
    }
    ,

    //UC-402
    signOfMeal: (req, res) => {
        const currentId = req.params.mealId;
        let mealIndex = data.mealData.findIndex((meal) => meal.mealId == currentId);
        if (mealIndex != -1) {
            //Participation code
            let meal = data.mealData[mealIndex]
            meal.participants.push();
            //Code to participate has not been implemented

            res.status(200).json({
                status: 200,
                result: "Sign off has succeeded."
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Sign off failed. "
            })
        }
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
        const meal = data.mealData.findIndex((meal)=> meal.id == mealId);
        console.log(`Participation details reached, index of meal is ${meal}`);
        let userIndex = data.mealData[meal].participants.findIndex((user)=> user.id == userId);
        console.log(`Index reached`);
        
        if(userIndex != -1){
            console.log(`Control passed`);
            let userFrom = data.mealData[meal].participants[userIndex];
            const message = {
                status: 200,
                result: userFrom
            }
            next(message);
        } else{
            const message = {
                status: 400,
                result: 'Could not get participant detail'
            }
            next(error);
        }
    }
}

module.exports = controller;