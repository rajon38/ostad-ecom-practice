//basic lib import
const { readdirSync } = require("fs");
const path = require("path")
const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require('express-rate-limit');

//middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

//request rate limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

//mongodb connection
let Option = { autoIndex: true }
mongoose.set('strictQuery', true)
    .connect(process.env.URI, Option)
    .then(() => {
        console.log('connected to DB');
    })
    .catch((err) => {
        console.log(err.message)
    });

//routing implement
readdirSync("./src/Routes").map(r => app.use("/api/v1", require(`./src/Routes/${r}`)));

//undefined route implement
app.use("*", (req, res) => {
    res.status(404).json({ status: "failed", data: "Not Found" })
});

module.exports = app;