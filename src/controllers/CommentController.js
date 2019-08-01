const Comment = require("../models/Comment").model;
const log = require("log-to-file");
const ObjectId = require("mongoose").Types.ObjectId;

class CommentController {
  async getByPlace(req, res) {
    try {
      const { id: placeId } = req.params;
      const comments = await Comment.find({ place: ObjectId(placeId) }, null, {
        sort: { createdAt: -1 }
      })
        .lean()
        .populate("user");

      return res.send(comments);
    } catch (err) {
      console.log(err);
      log(err, "./logs/votes-logs.log");
      return res.sendStatus(400, { error: err.message });
    }
  }

  async create(req, res) {
    try {
      const { place, text } = req.body;
      const user = req.userId;
      Comment.create({
        user,
        place,
        text
      })
        .then(async result => {
          return res.sendStatus(200);
        })
        .catch(err => {
          console.log(err);
          log(err, "./logs/votes-logs.log");
          return res.sendStatus(400, { error: err.message });
        });
    } catch (err) {
      console.log(err);
      log(err, "./logs/votes-logs.log");
      return res.sendStatus(400, { error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { text, placeId } = req.body;
      const { id } = req.params;
      Comment.updateOne(
        { _id: id, place: ObjectId(placeId) },
        {
          text
        }
      )
        .then(async result => {
          return res.sendStatus(200);
        })
        .catch(err => {
          console.log(err);
          log(err, "./logs/comments-logs.log");
          return res.sendStatus(400, { error: err.message });
        });
    } catch (err) {
      console.log(err);
      log(err, "./logs/comments-logs.log");
      return res.sendStatus(400, { error: err.message });
    }
  }
  async delete(req, res) {
    try {
      const { id } = req.params;
      const comment = await Comment.findOne({ _id: id });

      comment.remove();
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      log(err, "./logs/comments-logs.log");
      return res.sendStatus(400, { error: err.message });
    }
  }
}

module.exports = new CommentController();
