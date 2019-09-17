const Place = require("../models/Place").model;
const Places = require("google-places-web").default;

// Setup
Places.apiKey = process.env.GOOGLE_PLACES_KEY;
Places.debug = false; // boolean;

class PlaceController {
  async nearbySearch(req, res) {
    const { location, pagetoken, keyword } = req.query;

    const response = await Places.textsearch({
      query: location
    });
    let coord = response[0].geometry.location;

    Places.nearbysearch({
      location: `${coord.lat},${coord.lng}`, // LatLon delimited by" -28.934883,-49.485840"
      type: ["bar", "cafe", "restaurant"], // Undefined type will return all types
      rankby: "distance", // See google docs for different possible values
      pagetoken: pagetoken || null,
      keyword: keyword || null
    })
      .then(result => {
        return res.send(result);
      })
      .catch(e => {
        console.log(e);
        return res.send(false);
      });
  }
  async view(req, res) {
    const { id: placeId } = req.params;
    const place = await Place.findOne({ place_id: placeId }).lean();

    if (!place) {
      let newPlace = await Place.create({ place_id: placeId });

      Places.details({ placeid: placeId })
        .then(async result => {
          let sPlace = await Place.findOneAndUpdate(
            { _id: newPlace._id },
            result,
            {
              new: true
            }
          );
          return res.send(sPlace);
        })
        .catch(e => {
          return res.status(400);
        });
    } else {
      return res.send(place);
    }
  }
}

module.exports = new PlaceController();
