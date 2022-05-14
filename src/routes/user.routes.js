const express = require('express');

const UserRouter = express.Router();
const UserController = require('../controllers/user.controller');
const tokenAuthController = require('../controllers/auth.controller');
const logr = require('../config/config').logger;
//Test command.
UserRouter.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

//UC-201 Creates user. 
UserRouter.post("/api/user", 
UserController.validateUserRegistration,
UserController.checkUserExistence, 
UserController.createUser);

//UC-202 Retrieves all users
UserRouter.get("/api/user", 
UserController.getAllUsers);

//UC-203 Retrieve user profile, based on Token and userID
UserRouter.get("/api/user/profile",  
tokenAuthController.validateTokenLogin, 
UserController.getProfile);

//UC-204 Retrieves user, based on userId
UserRouter.get("/api/user/:userId",
tokenAuthController.validateTokenLogin,  
UserController.retrieveUserById);

//UC-205 Edits user. client will send object to api => sendObject {id:(id), newUserData:{attributes}}
UserRouter.put("/api/user/:userId",  
tokenAuthController.validateTokenLogin, 
UserController.validateUserPost, 
UserController.checkUserExistenceAndOwnership,  
UserController.updateUser);

//UC-206 Deletes user based on id, client will send id - (checkOwnerShip method) object to api
UserRouter.delete("/api/user/:userId", 
tokenAuthController.validateTokenLogin, 
UserController.checkOwnershipUser, 
UserController.deleteUser);

//Test

//UserRouter.put('/api/test/:mealId', UserController.testDateDB);
UserRouter.post('/api/test', UserController.checkToken);
UserRouter.post('/api/test/login', tokenAuthController.validateToken);
module.exports = UserRouter;