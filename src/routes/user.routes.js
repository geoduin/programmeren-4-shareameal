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
UserRouter.post("/api/user",UserController.validateUserPost, UserController.addUser);

//UC-202 Retrieves all users
UserRouter.get("/api/user", UserController.getAllUsers);

//UC-203 Retrieve user profile, based on Token and userID
//Token functionality has not been developed - in process
UserRouter.get("/api/user/profile", UserController.getProfile);

//UC-204 Retrieves user, based on userId
UserRouter.get("/api/user/:userId", UserController.retrieveUserById);

//UC-205 Edits user.
UserRouter.put("/api/user/:userId", UserController.updateUser);

//UC-206 Deletes user based on id
UserRouter.delete("/api/user/:userId", UserController.deleteUser);

//Method to check if email exists in in memory database - in process
function emailValidation(email) {
    const amount = userDataBase.filter((user) => user.email == email);
    console.log(`amount is: ${amount.length}`);
    return amount;
}

//Function to generate a token. Has yet to be developed. Currently has a placeholder return value - in process
function generateToken() {
    return "YouHaveAccessToken";
}

//A function that will assign a default value, in case the newValue is undefined. Otherwise it will return the original value
function assignDefaultValues(newValue) {
    if (newValue != undefined) {
        return newValue;
    } else {
        return "";
    }
}

module.exports = UserRouter;