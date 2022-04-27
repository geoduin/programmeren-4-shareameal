const express = require('express');
const ParticipationRouter = express.Router();
const controller = require('../controllers/participation.controller');

//UC-401
ParticipationRouter.post('/api/user/:userId/meal/:mealId/signup', controller.joinMeal);

//UC-402
ParticipationRouter.put('/api/user/:userId/meal/:mealId/signOff', controller.signOfMeal);
//UC-403
ParticipationRouter.get('/api/meal/:mealId/participants', controller.getAllParticipants);
//UC-404
ParticipationRouter.get('/api/meal/:mealId/particpants/:userId', controller.getParticipantsDetail);

module.exports = ParticipationRouter;