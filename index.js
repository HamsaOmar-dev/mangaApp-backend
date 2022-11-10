const express = require("express");
// const session = require("express-session");
const cors = require("cors");
// const connectRedis = require("connect-redis");
// require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 1000000 })
);

const prisma = require("./prisma.js");

prisma
  .$connect()
  .then(() => console.log("Prisma Connection established"))
  .catch((err) => console.log(err));

// const redisClient = require("./redis.js");

// redisClient.connect();
// redisClient.on("connect", (err) => {
//   if (err) console.log(err);
//   else console.log("Redis Connection established");
// });

// const RedisStore = connectRedis(session);

// app.use(
//   session({
//     name: "sid",
//     secret: "123",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: false,
//       // secure: process.env.NODE_ENV === "production",
//       maxAge: 1000 * 60 * 60 * 24, // 1 days
//     },
//     store: new RedisStore({
//       client: redisClient,
//     }),
//   })
// );

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// app.use(
//   cors()
//   {
//   credentials: true,
//   origin: "http://localhost:3000",
// }
// );

const indexRouter = require("./routes/index.js");
// const articlesRouter = require("./routes/articles.js");
// const topicRouter = require("./routes/topic.js");

app.use("/", indexRouter);
// app.use("/", articlesRouter);
// app.use("/", topicRouter);

app.listen(port, () => {
  console.log("Listening on port " + port);
});
