const Favorite = require("../models/Favorite").model;
const User = require("../models/User").model;
const log = require("log-to-file");
const ObjectId = require("mongoose").Types.ObjectId;

class FavoriteController {
  async index(req, res) {
    try {
      const favorites = await Favorite.find(
        { "user._id": ObjectId(req.userId) },
        null,
        { sort: { createdAt: -1 } }
      )
        .select("place -_id")
        .populate({
          path: "place"
        });

      return res.send(favorites);
    } catch (err) {
      console.log(err);
      log(err, "./logs/favorites-logs.log");
      return res.json({ error: err.message });
    }
  }

  async toggle(req, res) {
    try {
      const { placeId } = req.body;
      const user = await User.findOne({ _id: req.userId });
      const favorite = await Favorite.findOne({
        place: ObjectId(placeId),
        "user._id": ObjectId(req.userId)
      }).lean();
      if (!favorite) {
        const up = await Favorite.create({
          user,
          place: placeId
        });
        if (up) {
          return res.send();
        } else {
          return res.json({ error: "Não foi possivel favoritar" });
        }
      } else {
        await Favorite.deleteOne({
          place: ObjectId(placeId),
          "user._id": ObjectId(req.userId)
        });
        return res.send();
      }
    } catch (err) {
      console.log(err);
      log(err, "./logs/favorites-logs.log");
      return res.json({ error: err.message });
    }
  }
}

module.exports = new FavoriteController();
