const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.Mixed,
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

exports.model = mongoose.model("Favorite", FavoriteSchema);
exports.schema = FavoriteSchema;
