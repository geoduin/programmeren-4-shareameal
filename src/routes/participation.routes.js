const express = require('express');
const ParticipationRouter = express.Router();
const controller = require('../controllers/participation.controller');

//UC-401 join meal
ParticipationRouter.post('/api/user/:userId/meal/:mealId/signup', 
controller.tokenValidation ,
controller.checkExistenceMeal, 
controller.joinMeal);

//UC-402 leave meal
ParticipationRouter.put('/api/user/:userId/meal/:mealId/signOff',
controller.tokenValidation, 
controller.checkExistenceMeal,
controller.checkSignUp,
controller.signOfMeal);

//UC-403 get participants list
ParticipationRouter.get('/api/meal/:mealId/participants', controller.getAllParticipants);
//UC-404 get detail participant
ParticipationRouter.get('/api/meal/:mealId/particpants/:userId', controller.getParticipantsDetail);

module.exports = ParticipationRouter;