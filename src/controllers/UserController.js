const User = require("../models/User").model;
const jwt = require("jsonwebtoken");
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
