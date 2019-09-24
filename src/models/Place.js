const mongoose = require("mongoose");
const Vote = require("./Vote").model;
const ObjectId = require("mongoose").Types.ObjectId;

function formatDate(fullDate) {
  if (fullDate) {
    const date = `${("0" + fullDate.getDate()).slice(-2)}/${(
      "0" + fullDate.getMonth()
    ).slice(-2)}/${fullDate.getFullYear()}`;
    const hour = `${("0" + fullDate.getHours()).slice(-2)}:${(
      "0" + fullDate.getMinutes()
    ).slice(-2)}:${("0" + fullDate.getSeconds()).slice(-2)}`;
    return `${date}`;
  }
}

const PlaceSchema = new mongoose.Schema(
  {
    place_id: String,
    totalVotes: Number,
    name: String,
    photos: mongoose.Schema.Types.Mixed,
    opening_hours: mongoose.Schema.Types.Mixed,
    address_components: mongoose.Schema.Types.Mixed,
    geometry: mongoose.Schema.Types.Mixed,
    formatted_address: String,
    formatted_phone_number: String,
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

PlaceSchema.statics.getFullInfo = async function(placeId) {
  try {
    let place = await this.findOne({ _id: placeId }).lean();
    if (place) {
      const totalVotes = await Vote.countDocuments({
        place: placeId
      }).lean();

      const sumVotes = await Vote.aggregate([
        { $match: { place: ObjectId(placeId) } },
        {
          $group: {
            _id: {
              place: "$place"
            },
            amount: { $sum: "$vote" }
          }
        },
        {
          $project: {
            _id: 0,
            amount: 1
          }
        }
      ]);

      const comments = await Vote.find({ place: placeId }, null, {
        sort: { createdAt: -1 }
      }).lean();

      place.publishDate = formatDate(place.publishDate);
      place.comments = comments;
      place.votes = sumVotes[0].amount / totalVotes;
      place.total_votes = totalVotes;

      return place;
    } else {
      return cb("place not found");
    }
  } catch (err) {
    console.log(err);
  }
};
exports.model = mongoose.model("Place", PlaceSchema);
exports.schema = PlaceSchema;
