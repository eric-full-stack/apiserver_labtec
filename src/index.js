require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");
const passport = require("passport");
const expressip = require("express-ip");
const nodemailer = require("nodemailer");
var fs = require("fs");

class App {
  constructor() {
    this.express = express();
    this.server = require("http").Server(this.express);
    this.io = require("socket.io")(this.server);

    this.ioConnection();
    this.middlewares();
    this.database();
    this.routes();
    this.emailTransporter();
  }
  emailTransporter() {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lgbtapp@gmail.com",
        pass: "password"
      }
    });
    this.email = transporter;
  }
  ioConnection() {
    this.io.on("connection", socket => {
      socket.on("connectFeed", id => {
        socket.join(`feed`);
      });

      socket.on("disconnect", id => {
        socket.leave(id);
      });
    });
  }

  middlewares() {
    this.express.use(cors());
    this.express.use(passport.initialize());
    this.express.use(express.json());
    this.express.use(bodyParser.json());
    this.express.use(expressip().getIpInfoMiddleware);
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(morgan("dev"));
    this.express.use((req, res, next) => {
      req.io = this.io;
      req.email = this.email;
      return next();
    });
  }

  async database() {
    mongoose.set("useCreateIndex", true);
    const client = await mongoose
      .connect(process.env.MONGO_URL, { useNewUrlParser: true })
      .then(() => console.log("MongoDB Connected"))
      .catch(err => console.log(err));
  }

  routes() {
    this.express.use(routes);
  }
}

module.exports = new App().server;
