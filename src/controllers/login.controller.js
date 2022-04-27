const req = require("express/lib/request");
const data = require('../data/data.inMemory');
const assert = require('assert');

let controller = {
    inputValidation: (req, res, next) => {
        let loginData = req.body;
        try {
            assert(typeof loginData.email == 'string', 'Email must be a string input');
            assert(typeof loginData.password == 'string', 'Password must be a string');
            assert(loginData.email.length > 0, 'Email must be filled');
            assert(loginData.password.length > 0, 'Password must be filled');
            next();
        } catch (error) {
            console.log(error.message);
            const err = {
                status: 400,
                result: error.message
            }
            next(err);
        }
    },

    login: (req, res, next) => {
        const userEmail = req.body.email;
        const userPassWord = req.body.password;
        console.log(`Email ${userEmail} and password ${userPassWord}`);

        //Vervangen worden door database handelingen
        let userIndex = data.userData.findIndex((user) => user.email == userEmail);
        let passWordIndex = data.userData.findIndex((user) => user.password == userPassWord);
        //-------------------------------------------
        console.log(`Index of ${userEmail} is:  ${userIndex}`);
        console.log(`Index of ${userPassWord} is:  ${passWordIndex}`);
        let error = null;
        if (userIndex != -1) {
            if (passWordIndex != -1) {
                let User = data.userData[userIndex];
                console.log(User);
                //Placeholder function to generate token
                const token = generateToken();
                User = { ...User, token }
                res.status(200).json({
                    status: 200,
                    result: User
                })
            } else {
                error = {
                    status: 400,
                    result: "Password is incorrect"
                }
                next(error);
            }
        } else {
            error = {
                status: 400,
                result: "User not found"
            }
            next(error);
        }
    }
}


//Function to generate a token. Has yet to be developed. Currently has a placeholder return value - in process
function generateToken() {
    return "YouHaveAccessToken";
}
module.exports = controller;