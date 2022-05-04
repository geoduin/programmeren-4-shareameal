const express = require('express');
const ParticipationRouter = express.Router();
const controller = require('../controllers/participation.controller');

//UC-401 join meal - params -> userId, mealId
ParticipationRouter.post('/api/user/:userId/meal/:mealId/signup', 
controller.tokenValidation ,
controller.checkExistenceMeal, 
controller.joinMeal);

//UC-402 leave meal - params -> userId, mealId 
ParticipationRouter.put('/api/user/:userId/meal/:mealId/signOff',
controller.tokenValidation, 
controller.checkExistenceMeal,
controller.checkSignUp,
controller.signOfMeal);

//UC-403 get participants list - In the future, the token will determine if the meal is owned. For now, a object will be send object {id: (id)}
ParticipationRouter.get('/api/meal/:mealId/participants', 
controller.tokenValidation,
controller.checkExistenceMeal, 
controller.checkOwnerShipMeal,
controller.getAllParticipants);

//UC-404 get detail participant - In the future, the token will determine if the meal is owned. For now, a object will be send object {id: (id)}
ParticipationRouter.get('/api/meal/:mealId/participants/:userId', 
controller.tokenValidation,
controller.checkSignUp, 
controller.getParticipantsDetail);

module.exports = ParticipationRouter;