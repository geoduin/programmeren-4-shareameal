const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { use } = require("express/lib/application");
app.use(bodyParser.json());

//in memory database(Arrays)
//Voor de film
let database = [];
let id = 0;

//Voor gebruikers
let userDataBase = [
  {
    id: 97,
    firstname: "Xin",
    lastName: "Wang",
    city: "Rotterdam",
    street: "Moskouplein",
    email: "Xin20Wang@outlook.com",
    password: "NoPassword123"
  }, {
    id: 98,
    firstname: "Wessel",
    lastName: "Pijpers",
    city: "Alphen aan de Rhijn",
    street: "Alphen",
    email: "Wessel@outlook.com",
    password: "NoPassword456"
  }, {
    id: 99,
    firstname: "Brian",
    lastName: "Thomson",
    city: "Rotterdam",
    street: "Beurs",
    email: "BrieThom@outlook.com",
    password: "NoPassword789"
  },]
let UserId = 0;

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
//Creates movie to in memory database.
app.post("/api/movie", (req, res) => {
  let movie = req.body;
  id++;
  movie = {
    id,
    ...movie,
  };
  console.log(movie);
  database.push(movie);
  res.status(201).json({
    status: 201,
    result: database,
  });
});
//Example code used in the course; retrieves movie based on movieId
app.get("/api/movie/:movieId", (req, res, next) => {
  const movieId = req.params.movieId
  console.log(`Movie met ID ${movieId} gezocht`);
  let movie = database.filter((item) => item.id == movieId);
  if (movie.length > 0) {
    console.log(movie);
    res.status(200).json({
      status: 200,
      result: movie,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `Movie with ID ${movieId} not found`,
    });
  }
});
//Example code used in the course, retrieves all movies.
app.get("/api/movie", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

//Creates user.
app.post("/api/user", (req, res) => {
  let newUser = req.body;
  const newUserEmail = req.params.email;
  let amount = userDataBase.filter((item) => item.email == newUserEmail);

  if (amount == 0) {
    UserId++;
    newUser = { UserId, ...newUser, }
    console.log(newUser);
    userDataBase.push(newUser);
    res.status(200).json({
      status: 200,
      result: "User registered"
    })
  } else {
    console.log(newUser + "\nAlready exists");
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
    oldUser.firstname = newUser.firstname;
    oldUser.lastName = newUser.lastName;
    oldUser.city = newUser.city;
    oldUser.street = newUser.street;
    oldUser.email = newUser.email;
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
