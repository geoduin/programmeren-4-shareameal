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
    password: "NoPassword123"
  }, {
    id: 98,
    firstName: "Wessel",
    lastName: "Pijpers",
    city: "Alphen aan de Rhijn",
    street: "Alphen",
    email: "Wessel@outlook.com",
    password: "NoPassword456"
  }, {
    id: 99,
    firstName: "Brian",
    lastName: "Thomson",
    city: "Rotterdam",
    street: "Beurs",
    email: "BrieThom@outlook.com",
    password: "NoPassword789"
  },]
let id = 0;

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

//Creates user.
app.post("/api/user", (req, res) => {
  let newUser = req.body;
  const newUserEmail = req.body.email;
  let amount = userDataBase.filter((item) => item.email == newUserEmail);
  console.log(newUserEmail);
  console.log(amount.length);
  if (amount.length == 0) {
    id++;
    newUser = { id, ...newUser, }
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

//Retrieves user, based on userId
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

//Edits user.
app.put("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  const newUser = req.body;
  console.log("Id")
  console.log(userId);
  console.log("User in question");
  console.log(newUser);
  //Filters the array, based on userId. If the input userId is found in the in-memory database, it will return 1. otherwise it will return 0
  let user = userDataBase.filter((users)=> users.id == userId);
  console.log("User result is: \n" + user.length)

  if (user.length > 0) {
    let oldUser = user.at(0);
    console.log("Old")
    console.log(oldUser);
    oldUser.firstName = newUser.firstName;
    oldUser.lastName = newUser.lastName;
    oldUser.city = newUser.city;
    oldUser.street = newUser.street;
    if(emailValidation(newUser.email) == 0){
      oldUser.email = newUser.email;
    }
    
    oldUser.password = newUser.password;

    console.log("New")
    console.log(oldUser);
    res.status(200).json({
      status: 200,
      result: "Succesful transaction"
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "User update has failed"
    })
  }

})

//Verwijderen van een gebruiker op basis van een id
app.delete("/api/user/:userId", (req, res) => {
  const iD = req.params.userId;
  console.log(iD);
  let nr = userDataBase.findIndex((usr) => usr.id == iD);
  console.log(nr);
  if (nr > 0) {
    userDataBase.splice(nr, 1);
    res.status(200).json({
      status: 200,
      result: userDataBase,
    })
  } else {
    res.status(400).json({
      status: 400,
      result: "Removal failed"
    })
  }
})

//Haalt alle gebruikers op.
app.get("/api/user", (req, res) => {
  console.log(userDataBase);
  res.status(200).json({
    status: 200,
    result: userDataBase,
  })
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
  const amount = userDataBase.filter((user)=> user.email == email);
  console.log("amount is: " + amount.length);
  return amount;
}
