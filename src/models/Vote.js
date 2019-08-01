const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.Mixed,
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
    required: true
  },
  vote: Number,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

exports.model = mongoose.model("Vote", VoteSchema);
exports.schema = VoteSchema;
