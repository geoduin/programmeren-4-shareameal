const express = require('express');
const LoginRouter = express.Router();
const LoginController = require('../controllers/login.controller');

//UC-101 Login functionality, returns user and token - in process
LoginRouter.post("/api/auth/login",
LoginController.inputValidation, 
LoginController.login
);
LoginRouter.put("/api/test/testLogin/:password", LoginController.testDateDB)
module.exports = LoginRouter;