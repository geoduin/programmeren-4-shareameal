const express = require('express');
const ParticipationRouter = express.Router();
const controller = require('../controllers/participation.controller');
const authorizationController = require('../controllers/auth.controller');

//UC-401 join meal - params -> userId, mealId
ParticipationRouter.post('/api/meal/:mealId/participate', 
authorizationController.validateTokenLogin,
controller.checkExistenceMeal, 
controller.joinMeal);

//UC-402 leave meal - params -> mealId 
ParticipationRouter.put('/api/meal/:mealId/signOff',
authorizationController.validateTokenLogin, 
controller.checkExistenceMeal,
controller.checkSignUp,
controller.signOfMeal);

//UC-403 get participants list
ParticipationRouter.get('/api/meal/:mealId/participants', 
authorizationController.validateTokenLogin,
controller.checkExistenceMeal, 
controller.checkOwnerShipMeal,
controller.getAllParticipants);

//UC-404 get detail participant
ParticipationRouter.get('/api/meal/:mealId/participants/:userId', 
authorizationController.validateTokenLogin,
controller.checkSignUp, 
controller.getParticipantsDetail);

module.exports = ParticipationRouter;