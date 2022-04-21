const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { use } = require("express/lib/application");
const { status } = require("express/lib/response");
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

//UC-201 Creates user. 
//Note: I assume the attributes firstname, lastname, city, street, email and password are mandetory.
//Thus there are no default values for thes attributes
app.post("/api/user", (req, res) => {
  let newUser = req.body;
  const newUserEmail = req.body.email;
  let amount = userDataBase.filter((item) => item.email == newUserEmail);
  console.log(`Email: ${newUserEmail}, has ${amount.length} results.`);
  if (amount.length == 0) {
    id++;
    let isActive = assignDefaultValues(newUser.isActive);
    let phoneNumber = assignDefaultValues(newUser.phoneNumber);
    newUser = {id, ...newUser, isActive, phoneNumber }
    console.log(newUser);
    userDataBase.push(newUser);
    res.status(200).json({
      status: 200,
      result: `User with email: ${newUserEmail}, has been registered.`,
      user: newUser
    })
  } else {
    console.log(`User with email: ${newUserEmail}, has already been registered`);
    res.status(400).json({
      status: 400,
      result: `User with email: ${newUserEmail}, has already been registered`
    })
  }

})

//UC-202 Retrieves all users
app.get("/api/user", (req, res) => {
  console.log(userDataBase);
  res.status(200).json({
    status: 200,
    result: userDataBase,
  })
})

//UC-203 Retrieve user profile, based on Token and userID
app.get("/api/user/profile", (req, res) => {
  //Token, still empty
  res.status(400).json({
    status: 400,
    result: "Failed profile retrieval",
    note: "Correct token functionality has not been implemented"
  })
})

//UC-204 Retrieves user, based on userId
app.get("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`Movie met ID ${userId} gezocht`);
  let user = userDataBase.filter((item) => item.id == userId);
  if (user.length > 0) {
    console.log(user);
    res.status(200).json({
      status: 200,
      answer: `User with id: ${userId} found`,
      result: user
    })
  } else {
    res.status(400).json({
      status: 400,
      result: `User with id: ${userId} does not exist`
    })
  }
})

//UC-205 Edits user.
app.put("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  const newUser = req.body;
  console.log(`UserID of ${newUser.firstName} is ${userId}. User in question is ${newUser}`)
  //Filters the array, based on userId. If the input userId is found in the in-memory database, 
  //it will return 1. otherwise it will return 0
  let user = userDataBase.filter((users) => users.id == userId);
  console.log(`Amount of users are: ${user.length}`)
  if (user.length > 0) {
    let oldUser = user.at(0);
    console.log(`Old: ${oldUser}`)
    //Assigns values to object
    oldUser.firstName = newUser.firstName;
    oldUser.lastName = newUser.lastName;
    oldUser.city = newUser.city;
    oldUser.street = newUser.street;
    oldUser.password = newUser.password;
    //If the new email has been taken, it will not change the emailaddress
    if (emailValidation(newUser.email) == 0) {
      oldUser.email = newUser.email;
    }
    oldUser.isActive = assignDefaultValues(newUser.isActive);
    oldUser.phoneNumber = assignDefaultValues(newUser.phoneNumber);
    console.log(`New: ${oldUser}.`)
    res.status(200).json({
      status: 200,
      result: "Succesful transaction",
      updatedUser: oldUser
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Update has failed"
    })
  }

})

//UC-206 Deletes user based on id
app.delete("/api/user/:userId", (req, res) => {
  const iD = req.params.userId
  let nr = userDataBase.findIndex((usr) => usr.id == iD);
  console.log(`Index of UserID: ${iD} is ${nr}.`);
  if (nr != -1) {
    userDataBase.splice(nr, 1);
    res.status(200).json({
      status: 200,
      result: `User with user with Id ${iD}, has been removed.`,
      CurrentUsers: userDataBase 
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Removal failed"
    })
  }
})


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

