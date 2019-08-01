const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },
    text: { type: String, required: true, minlength: 1, maxlength: 140 },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toObject: { getters: true, virtuals: true },
    toJSON: { getters: true, virtuals: true }
  }
);

exports.model = mongoose.model("Comment", CommentSchema);
exports.schema = CommentSchema;
