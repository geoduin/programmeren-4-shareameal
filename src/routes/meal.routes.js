const express = require('express');
const MealRouter = express.Router();
const mealController = require('../controllers/meal.controller');

//UC-301 Register meal - in process
MealRouter.post("/api/meal", 
mealController.validateLogin,
mealController.validateMealCreation, 
mealController.createMeal);

//UC-302 Update meal - in process
MealRouter.put("/api/meal/:mealId", 
mealController.validateLogin,
mealController.validateMealCreation, 
mealController.checkMealStatus, 
mealController.updateMealById);

//UC-303 Get all meals - in process
MealRouter.get("/api/meal", 
mealController.getAllMeals);

//UC-304 get meal based on id - in process
MealRouter.get("/api/meal/:mealId", 
mealController.getMealById);

//UC-305 Delete meal - in process
MealRouter.delete("/api/meal/:mealId", 
mealController.validateLogin,
mealController.checkMealStatus,
mealController.deleteMeal);


module.exports = MealRouter;
