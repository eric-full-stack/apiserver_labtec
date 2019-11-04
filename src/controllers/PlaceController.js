const Place = require("../models/Place").model;
const axios = require("axios");

class PlaceController {
  async nearbySearch(req, res) {
    const { location, pagetoken, keyword } = req.query;
    try {
      const resp = await axios.get(
        !pagetoken
          ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=5000&type=restaurant&key=${process.env.GOOGLE_PLACES_KEY}`
          : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&pagetoken=${pagetoken}&radius=5000&type=restaurant&key=${process.env.GOOGLE_PLACES_KEY}`
      );
      return res.send(resp.data);
    } catch (e) {
      console.log(e);
      return res.send(false);
    }
  }
  async textSearch(req, res) {
    const { location, query, pagetoken } = req.query;
    try {
      const resp = await axios.get(
        !pagetoken
          ? `https://maps.googleapis.com/maps/api/place/textsearch/json?location=${location}&query=${encodeURI(
              query
            )}&radius=5000&region=.br&language=pt-BR&type=restaurant&key=${
              process.env.GOOGLE_PLACES_KEY
            }`
          : `https://maps.googleapis.com/maps/api/place/textsearch/json?location=${location}&query=${encodeURI(
              query
            )}&pagetoken=${pagetoken}&radius=5000&type=restaurant&key=${
              process.env.GOOGLE_PLACES_KEY
            }`
      );
      return res.send(resp.data);
    } catch (e) {
      console.log(e);
      return res.send(false);
    }
  }
  async view(req, res) {
    const { id: placeId } = req.params;

    const place = await Place.findOne({ place_id: placeId }).lean();
    if (!place) {
      let newPlace = await Place.create({ place_id: placeId });
      const resp = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_PLACES_KEY}`
      );
      if (resp.data.status == "OK") {
        let sPlace = await Place.findOneAndUpdate(
          { _id: newPlace._id },
          resp.data.result,
          {
            new: true
          }
        );
        const fullInfoPlace = await Place.getFullInfo(sPlace._id, req.userId);
        return res.send(fullInfoPlace);
      }
    } else {
      const fullInfoPlace = await Place.getFullInfo(place._id, req.userId);
      return res.send(fullInfoPlace);
    }
  }
}

module.exports = new PlaceController();
