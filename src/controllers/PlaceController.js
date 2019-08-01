const Place = require("../models/Place").model;
const log = require("log-to-file");
const Places = require("google-places-web").default;

// Setup
Places.apiKey = process.env.GOOGLE_PLACES_KEY;
Places.debug = false; // boolean;

class PlaceController {
  async nearbySearch(req, res) {
    const { location, pagetoken, keyword } = req.body;
    Places.nearbysearch({
      location: location, // LatLon delimited by" -28.934883,-49.485840"
      type: ["bar", "cafe", "restaurant"], // Undefined type will return all types
      rankby: "distance", // See google docs for different possible values
      pagetoken: pagetoken || null,
      keyword: keyword || null
    })
      .then(result => {
        return res.send(result);
      })
      .catch(e => {});
  }
  async view(req, res) {
    const { placeId } = req.params;
    Places.details({ placeid: placeId })
      .then(result => {
        const place = Place.findOne({ _id: placeId });
        if (!place) {
          Place.create(result);
          return res.send(result);
        } else {
          return res.send(Place.getFullInfo({ placeId }));
        }
      })
      .catch(e => {});
  }
}

module.exports = new PlaceController();
