// Dit is een functie
let myPrint = function (param) {
  console.log("param = " + param);
};

// Lambda functie
let myFunction = (param) => {
  console.log("my param = " + param);
};

myFunction(5);

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
