const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 1000000 })
);

// const allowlist = ["https://freewsj.com"];
// const corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (allowlist.indexOf(req.header("Origin")) !== -1) {
//     corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false }; // disable CORS for this request
//   }
//   callback(null, corsOptions); // callback expects two parameters: error and options
// };

// var corsOptions = {
//   origin: false,
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// app.use(cors(corsOptions));

const prisma = require("./prisma.js");

prisma
  .$connect()
  .then(() => console.log("Prisma Connection established"))
  .catch((err) => console.log(err));

const indexRouter = require("./routes/index.js");
const mangaRouter = require("./routes/manga.js");

app.use("/", indexRouter);
app.use("/", mangaRouter);

app.listen(port, () => {
  console.log("Listening on port " + port);
});
