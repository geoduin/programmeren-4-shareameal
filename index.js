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
},{
  id: 98,
  firstname: "Wessel",
  lastName: "Pijpers",
  city: "Alphen aan de Rhijn",
  street: "Alphen",
  email: "Wessel@outlook.com",
  password: "NoPassword456"
},{
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

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});

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

app.get("/api/movie", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

//Aanmaken van een gebruiker
app.post("/api/user", (req, res)=>{
  let newUser = req.body;
  const newUserEmail = req.params.email;
  let amount = userDataBase.filter((item)=> item.email == newUserEmail);

  if(amount == 0){
    UserId++;
    newUser ={UserId,...newUser,}
    console.log(newUser);
    userDataBase.push(newUser);
    res.status(200).json({
      status: 200,
      result: "User registered"
    })
  } else{
    console.log(newUser + "\nAlready exists");
    res.status(400).json({
      status: 400,
      result: `User with email: ${newUserEmail}, already registered`
    })
  }
  
})

//Ophalen van een gebruiker op basis van een id
app.get("/api/user/:userId",(req, res)=>{
  const userId = req.params.userId;
  console.log(`Movie met ID ${userId} gezocht`);
  let user = userDataBase.filter((item)=> item.id == id);
  if(user.length > 0){
    console.log(user);
    res.status(200).json({
      status: 200,
      result: user
    })
  } else{
    res.status(400).json({
      status: 400,
      result: `User with id: ${userId} does not exist`
    })
  }
})

//Wijzigen van een gebruiker op basis van een id
app.put("/api/user/:userId", (req, res)=>{

})

//Verwijderen van een gebruiker op basis van een id
app.delete("/api/user/:userId", (req, res)=>{

})

//Haalt alle gebruikers op.
app.get("/api/user", (req, res)=>{
  console.log(userDataBase);
  res.status(200).json({
    status: 200,
    result: userDataBase,
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
