const express = require('express');

const UserRouter = express.Router();
const UserController = require('../controllers/user.controller');

//Test command.
UserRouter.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});
//UC-201 Creates user. 
//Note: I assume the attributes firstname, lastname, city, street, email and password are mandetory.
//Thus there are no default values for thes attributes
UserRouter.post("/api/user", 
UserController.validateUserRegistration, 
UserController.createUser);

//UC-202 Retrieves all users
UserRouter.get("/api/user", 
UserController.getAllUsers);

//UC-203 Retrieve user profile, based on Token and userID
//Token functionality has not been developed - in process
UserRouter.get("/api/user/profile",  
UserController.checkToken, 
UserController.getProfile);

//UC-204 Retrieves user, based on userId
UserRouter.get("/api/user/:userId",
UserController.checkToken, 
UserController.retrieveUserById);

//UC-205 Edits user. client will send object to api => sendObject {id:(id), newUserData:{attributes}}
UserRouter.put("/api/user/:userId",  
UserController.checkLogin, 
UserController.validateUserPost, 
UserController.checkUserExistenceAndOwnership,  
UserController.updateUser);

//UC-206 Deletes user based on id, client will send id - (checkOwnerShip method) object to api
UserRouter.delete("/api/user/:userId", 
UserController.checkLogin, 
UserController.checkOwnershipUser, 
UserController.deleteUser);

module.exports = UserRouter;