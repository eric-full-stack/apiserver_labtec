const Vote = require("../models/Vote").model;
const Place = require("../models/Place").model;
const User = require("../models/User").model;
const log = require("log-to-file");
const ObjectId = require("mongoose").Types.ObjectId;

class VoteController {
  async create(req, res) {
    try {
      const { id: placeId } = req.params;
      const { vote, description } = req.body;
      const user = await User.findOne({ _id: req.userId }, "name,avatar");
      const vote = await Vote.findOne({
        place: ObjectId(placeId),
        "user._id": ObjectId(req.userId)
      }).lean();
      if (!vote) {
        await Vote.create({
          user,
          place: placeId,
          vote,
          description
        });

        return res.sendStatus(200);
      }
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
