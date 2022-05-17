const express = require("express");
const app = express();
require('dotenv').config();

const port = process.env.PORT;

const bodyParser = require("body-parser");
const { use } = require("express/lib/application");
const { status } = require("express/lib/response");

//Routers
const UserRouter = require('./src/routes/user.routes');
const MealRouter = require('./src/routes/meal.routes');
const LoginRouter = require('./src/routes/login.routes');
const ParticipateRouter = require('./src/routes/participation.routes');
const res = require("express/lib/response");
const logr = require('./src/config/config').logger;
app.use(bodyParser.json());

//In-memory database for users
let userDataBase = [
  {
    id: 0,
    firstName: "Xin",
    lastName: "Wang",
    city: "Rotterdam",
    street: "Moskouplein",
    email: "Xin20Wang@outlook.com",
    password: "NoPassword123",
    isActive: true,
    phoneNumber: "06 12425475"
  }, {
    id: 1,
    firstName: "Wessel",
    lastName: "Pijpers",
    city: "Alphen aan de Rhijn",
    street: "Alphen",
    email: "Wessel@outlook.com",
    password: "NoPassword456",
    isActive: true,
    phoneNumber: "06 12425475"
  }, {
    id: 2,
    firstName: "Brian",
    lastName: "Thomson",
    city: "Rotterdam",
    street: "Beurs",
    email: "BrieThom@outlook.com",
    password: "NoPassword789",
    isActive: true,
    phoneNumber: "06 12425475"
  },]
//Note: Due to the dummydata present within the in-memory database(in case of testing), the id will start at 2 instead of 0.
let id = 2;

app.all("*", (req, res, next) => {
  const method = req.method;
  logr.trace(`Method ${method} is aangeroepen`);
  next();
});
//Test command.
app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "API van Xin X. Wang 2154458, 17 mei 2022",
  });
});

//User router
app.use(UserRouter);

//Meal router
app.use(MealRouter);

//Login Router
app.use(LoginRouter);

//Meal participation Router
app.use(ParticipateRouter);

//Error handling
app.use((err,req, res, next)=>{
  res.status(err.status).json(err);
});


//Miscellaneous code
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});
//Miscellaneous code
app.listen(port, () => {
  logr.trace(`Example app listening on port ${port}`);
});


module.exports = app;