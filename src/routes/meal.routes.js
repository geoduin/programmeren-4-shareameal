const express = require('express');
const MealRouter = express.Router();
const mealController = require('../controllers/meal.controller');

//UC-301 Register meal - in process
MealRouter.post("/api/meals", mealController.createMeal);
  
  //UC-302 Get all meals - in process
  MealRouter.get("/api/meals", mealController.getAllMeals);
  //UC-303 get meal based on id - in process
  MealRouter.get("/api/meals/:mealId", mealController.getMealById);
  //UC-304 Update meal - in process
  MealRouter.put("/api/meals/:mealId", mealController.updateMealById);
  //UC-305 Delete meal - in process
  MealRouter.delete("/api/meals/:mealId", mealController.deleteMeal);
  
  //UC-401 Participate in meal - in process
  MealRouter.put("/api/meals/:mealid", (req, res) => {
    const currentId = req.params.mealId;
    let mealIndex = mealDatabase.findIndex((meal) => meal.mealId == currentId);
    if (mealIndex != -1) {
      //Participation code
      let meal = mealDatabase[mealIndex]
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
  })

module.exports = MealRouter;
