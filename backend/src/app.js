const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const notFound = require("./middlewares/notfound.middleware");
const errorHandler = require("./middlewares/notfound.middleware");

const app = express();

// security
app.use(helmet());
// cors
app.use(cors());
// json and urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// use the routes folder
app.use("/api", routes);

// not found middleware
app.use(notFound);

// error middleware
app.use(errorHandler);

module.exports = app;