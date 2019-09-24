const User = require("../models/User").model;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const log = require("log-to-file");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    process.env.SECRET,
    {
      expiresIn: "2y"
    }
  );
}

class UserController {
  async register(req, res) {
    try {
      const { name, email, password, age } = req.body;
      if (await User.findOne({ email }).lean())
        return res.send({ error: "User already exists." });

      await User.create({
        name,
        email,
        age,
        password,
        provider: "default"
      })
        .then(user => {
          user.password = undefined;
          res.send({ profile: user, token: generateToken(user) });
        })
        .catch(err => {
          console.log(err);
          log(err, "./logs/user-logs.log");
          return res.send({ error: "Registration failed." });
        });
    } catch (err) {
      console.log(err);
      log(err, "./logs/user-logs.log");
      return res.json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { name, age, gender, state, city } = req.body;
      if (req.params.id != req.userId)
        return res.sendStatus(401, { error: "Not you!" });
      let user = await User.findOne({ _id: req.params.id });
      if (user) {
        user.name = name;
        user.age = age;
        user.gender = gender;
        user.state = state;
        user.city = city;
        user.ip = req.ipInfo;
        await user.save();
        return res.send();
      } else {
        return res.status(404).send({ error: "User not found." });
      }
    } catch (err) {
      console.log(err);
      log(err, "./logs/user-logs.log");
      return res.json({ error: err.message });
    }
  }

  async authenticateDefault(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.send({ error: "User not found" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.send({ error: "Invalid password" });

    user.password = undefined;

    res.send({ profile: user, token: generateToken(user) });
  }

  async authenticateFacebook(req, res) {
    try {
      if (!req.user) {
        return res.sendStatus(401, { error: "Not you!" });
      }
      let user = req.user;
      user.ip = req.ipInfo;
      user.save();

      return res.send({ profile: user, token: generateToken(req.user) });
    } catch (err) {
      console.log(err);
      log(err, "./logs/user-logs.log");
      return res.json({ error: "User Not Authenticated" });
    }
  }

  async authenticateGoogle(req, res) {
    try {
      if (!req.user) {
        return res.sendStatus(401, { error: "Not you!" });
      }
      let user = req.user;
      user.ip = req.ipInfo;
      user.save();

      return res.send({ profile: user, token: generateToken(req.user) });
    } catch (err) {
      console.log(err);
      log(err, "./logs/user-logs.log");
      return res.sendStatus(401, { error: "User not authenticated!" });
    }
  }
}

module.exports = new UserController();
