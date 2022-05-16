const express = require('express');
const MealRouter = express.Router();
const mealController = require('../controllers/meal.controller');
const authorizationController = require('../controllers/auth.controller');
//UC-301 Register meal 
MealRouter.post("/api/meal",
authorizationController.validateTokenLogin,  
mealController.validateMealCreation,
mealController.createMeal);

//UC-302 Update meal
MealRouter.put("/api/meal/:mealId", 
authorizationController.validateTokenLogin, 
mealController.validateMealCreation, 
mealController.checkMealStatus, 
mealController.updateMealById);

//UC-303 Get all meals
MealRouter.get("/api/meal", 
mealController.getAllMeals);

//UC-304 get meal based on id 
MealRouter.get("/api/meal/:mealId", 
mealController.getMealById);

//UC-305 Delete meal
MealRouter.delete("/api/meal/:mealId", 
authorizationController.validateTokenLogin, 
mealController.checkMealStatus,
mealController.deleteMeal);



module.exports = MealRouter;
