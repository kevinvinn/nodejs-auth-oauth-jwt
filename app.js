require("dotenv").config();
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
require("./controllers/oauth/oauth.controller");
const passport = require("passport");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

require("./services/cronjob");

const PORT = 3000;
const router = require("./routes/route");
//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.set("trust proxy", 1);

app.use(
  session({
    cookie: {
      maxAge: 86400000,
    },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// serve swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(router);

app.use(function (req, res, next) {
  return res.status(404).json({
    status: "error",
    message: "Not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
