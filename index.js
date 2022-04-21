const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { use } = require("express/lib/application");
app.use(bodyParser.json());


//Voor gebruikers
let userDataBase = [
  {
    id: 97,
    firstName: "Xin",
    lastName: "Wang",
    city: "Rotterdam",
    street: "Moskouplein",
    email: "Xin20Wang@outlook.com",
    password: "NoPassword123",
    isActive: true,
    phoneNumber: "06 12425475"
  }, {
    id: 98,
    firstName: "Wessel",
    lastName: "Pijpers",
    city: "Alphen aan de Rhijn",
    street: "Alphen",
    email: "Wessel@outlook.com",
    password: "NoPassword456",
    isActive: true,
    phoneNumber: "06 12425475"
  }, {
    id: 99,
    firstName: "Brian",
    lastName: "Thomson",
    city: "Rotterdam",
    street: "Beurs",
    email: "BrieThom@outlook.com",
    password: "NoPassword789",
    isActive: true,
    phoneNumber: "06 12425475"
  },]
let id = 0;

//Voor maaltijden
let mealDatabase = [];
let mealId = 0;
//Default values
let isActive = true;
let phoneNumber = null;
let value = true;

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
//UC-203 Retrieve user profile, based on Token and userID
app.get("/api/user/profile", (req, res) => {
  //Token, still empty

  if (value) {
    value = false;
    res.status(200).json({
      status: 200,
      result: "Profile retrieval succeeded"
    })
  } else {
    value = true;
    res.status(400).json({
      status: 400,
      result: "Failed profile retrieval"
    })
  }
})
//UC-201 Creates user.
app.post("/api/user", (req, res) => {
  let newUser = req.body;
  const newUserEmail = req.body.email;
  let amount = userDataBase.filter((item) => item.email == newUserEmail);
  console.log(newUserEmail);
  console.log(amount.length);
  if (amount.length == 0) {
    id++;
    newUser = { id, ...newUser, isActive, phoneNumber }
    console.log(newUser);
    userDataBase.push(newUser);
    res.status(200).json({
      status: 200,
      result: "User registered"
    })
  } else {
    console.log(newUserEmail + " Already exists");
    res.status(400).json({
      status: 400,
      result: `User with email: ${newUserEmail}, already registered`
    })
  }

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
  //Filters the array, based on userId. If the input userId is found in the in-memory database, it will return 1. otherwise it will return 0
  let user = userDataBase.filter((users) => users.id == userId);
  console.log(`Amount of users are: ${user.length}`)
  if (user.length > 0) {
    let oldUser = user.at(0);
    console.log(`Old: ${oldUser}`)
    oldUser.firstName = newUser.firstName;
    oldUser.lastName = newUser.lastName;
    oldUser.city = newUser.city;
    oldUser.street = newUser.street;
    if (emailValidation(newUser.email) == 0) {
      oldUser.email = newUser.email;
    }
    oldUser.password = newUser.password;
    oldUser.isActive = newUser.isActive;
    oldUser.phoneNumber = newUser.phoneNumber;
    console.log(`New: ${oldUser}.`)
    res.status(200).json({
      status: 200,
      result: "Succesful transaction"
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
  console.log(iD);
  let nr = userDataBase.findIndex((usr) => usr.id == iD);
  console.log(nr);
  console.log(`Index of UserID: ${iD} is ${nr}.`);
  if (nr != -1) {
    userDataBase.splice(nr, 1);
    res.status(200).json({
      status: 200,
      result: `User with user with Id ${iD}, has been removed.` + userDataBase
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Removal failed"
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

//UC-101 Login functionality, returns user and token
app.get("/api/auth/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassWord = req.body.password;
  console.log(`Email ${userEmail} and password ${userPassWord}`);
  let userIndex = userDataBase.findIndex((user) => user.email == userEmail && user.password == userPassWord);
  console.log(`Index of ${userEmail} is:  ${userIndex}`);

  if (userIndex != -1) {
    let User = userDataBase[userIndex];
    console.log(User);
    const token = generateToken();
    User = {
      User,
      token
    }
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

//UC-301 Register meal
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

//UC-302 Get all meals
app.get("/api/meals", (req, res) => {
  res.status(200).json({
    status: 200,
    result: mealDatabase
  })
})
//UC-303 get meal based on id
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
//UC-304 Update meal
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
//UC-305 Delete meal
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
//UC-306 Participate in meal
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
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function emailValidation(email) {
  const amount = userDataBase.filter((user) => user.email == email);
  console.log(`amount is: ${amount.length}`);
  return amount;
}

function generateToken() {
  return "YouHaveAcces";
}
