const Vote = require("../models/Vote").model;
const Place = require("../models/Place").model;
const User = require("../models/User").model;
const log = require("log-to-file");
const ObjectId = require("mongoose").Types.ObjectId;

class VoteController {
  async index(req, res) {
    try {
      const votes = await Vote.find({
        "user._id": ObjectId(req.userId)
      })
        .lean()
        .populate("place", "name");
      return res.send(votes);
    } catch (err) {
      console.log(err);
      log(err, "./logs/votes-logs.log");
      return res.json({ error: err.message });
    }
  }
  async create(req, res) {
    try {
      const { id: placeId } = req.params;
      const { vote, description } = req.body;
      const user = await User.findOne(
        { _id: req.userId },
        "name email avatar"
      ).lean();
      const voteObj = await Vote.findOne({
        place: ObjectId(placeId),
        "user._id": ObjectId(req.userId)
      }).lean();
      if (!voteObj) {
        await Vote.create({
          user,
          place: placeId,
          vote,
          description
        });

        return res.sendStatus(200);
      } else {
        return res.json({
          error: "Apenas uma avaliação permitida por usuário"
        });
      }
    } catch (err) {
      console.log(err);
      log(err, "./logs/votes-logs.log");
      return res.json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id: voteId } = req.params;
      const { vote, description } = req.body;
      const user = await User.findOne(
        { _id: req.userId },
        "name email avatar"
      ).lean();
      const voteObj = await Vote.findOneAndUpdate(
        {
          _id: ObjectId(voteId),
          "user._id": ObjectId(req.userId)
        },
        { vote, description }
      );
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      log(err, "./logs/votes-logs.log");
      return res.json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { id: placeId } = req.params;
      Vote.deleteOne({
        place: ObjectId(placeId),
        "user._id": ObjectId(req.userId)
      })
        .then(async result => {
          return res.sendStatus(200);
        })
        .catch(err => {
          console.log(err);
          log(err, "./logs/votes-logs.log");
          return res.json({ error: err.message });
        });
    } catch (err) {
      console.log(err);
      log(err, "./logs/votes-logs.log");
      return res.json({ error: err.message });
    }
  }
}

module.exports = new VoteController();
