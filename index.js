const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { use } = require("express/lib/application");
const { status } = require("express/lib/response");

const UserRouter = require('./src/routes/user.routes');
const res = require("express/lib/response");

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

//In-memory-database for meals - in process
let mealDatabase = [];
let mealId = 0;

//Default values
let defaultBoolean = "";
let defaultPhoneNumber = "";

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});
//Test command.
app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});



//UC-101 Login functionality, returns user and token - in process
app.get("/api/auth/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassWord = req.body.password;
  console.log(`Email ${userEmail} and password ${userPassWord}`);
  let userIndex = userDataBase.findIndex((user) => user.email == userEmail && user.password == userPassWord);
  console.log(`Index of ${userEmail} is:  ${userIndex}`);

  if (userIndex != -1) {
    let User = userDataBase[userIndex];
    console.log(User);
    //Placeholder function to generate token
    const token = generateToken();
    User = { User, token }
    res.status(200).json({
      status: 200,
      result: User
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Login failed"
    })
  }
})

//Refactor
app.use(UserRouter);


//Error handling
app.use((err,req, res, next)=>{
  res.status(err.status).json(err);
});


//UC-301 Register meal - in process
app.post("/api/meals", (req, res) => {
  let newMeal = req.body;
  mealId++;
  newMeal = {
    mealId, ...newMeal
  }
  mealDatabase.push(newMeal);

  res.status(200).json({
    status: 200,
    result: "Meal added to meal database"
  })
})

//UC-302 Get all meals - in process
app.get("/api/meals", (req, res) => {
  res.status(200).json({
    status: 200,
    result: mealDatabase
  })
})
//UC-303 get meal based on id - in process
app.get("/api/meals/:mealId", (req, res) => {
  const currentId = req.params.mealId;
  let mealIndex = mealDatabase.findIndex((meal) => meal.mealId == currentId);

  if (mealIndex != -1) {
    res.status(200).json({
      status: 200,
      result: mealDatabase[mealIndex]
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Meal retrieval failed"
    })
  }
})
//UC-304 Update meal - in process
app.put("/api/meals/:mealId", (req, res) => {
  const currentId = req.params.mealId;
  let mealIndex = mealDatabase.findIndex((meal) => meal.mealId == currentId);
  if (mealIndex != -1) {
    //Update code
    res.status(200).json({
      status: 200,
      result: mealDatabase[mealIndex]
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Meal update failed"
    })
  }
})
//UC-305 Delete meal - in process
app.delete("/api/meals/:mealId", (req, res) => {
  const currentId = req.params.mealId;
  let mealIndex = mealDatabase.findIndex((meal) => meal.mealId == currentId);
  if (mealIndex != -1) {
    //Delete code
    mealDatabase.splice(mealIndex, 1);
    res.status(200).json({
      status: 200,
      result: mealDatabase[mealIndex]
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Meal update failed"
    })
  }
})
//UC-306 Participate in meal - in process
app.put("/api/meals/:mealid", (req, res) => {
  const currentId = req.params.mealId;
  let mealIndex = mealDatabase.findIndex((meal) => meal.mealId == currentId);
  if (mealIndex != -1) {
    //Participation code
    let meal = mealDatabase[mealIndex]
    //Code to participate has not been implemented

    res.status(200).json({
      status: 200,
      result: "Participation completed"
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Participation failed"
    })
  }
})

//Miscellaneous code
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});
//Miscellaneous code
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

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
function assignDefaultValues(newValue){
  if(newValue != undefined){
    return newValue;
  } else {
    return "";
  }
}

