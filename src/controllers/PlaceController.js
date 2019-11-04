const Place = require("../models/Place").model;
const axios = require("axios");

class PlaceController {
  async nearbySearch(req, res) {
    const { location, pagetoken } = req.query;
    try {
      const lat = location.split(",")[0].split(".")[0];
      const long = location.split(",")[1].split(".")[0];
      if (!pagetoken) {
        const places = await Place.find({
          latitude: lat,
          longitude: long
        }).lean();
        if (places.length === 0) {
          const resp = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=5000&type=restaurant&key=${process.env.GOOGLE_PLACES_KEY}`
          );
          if (resp.data.status === "OK") {
            for (let index = 0; index < resp.data.results.length; index++) {
              await Place.create({
                ...resp.data.results[index],
                latitude: lat,
                longitude: long
              });
            }
          }
          return res.send(resp.data);
        } else {
          return res.send(places);
        }
      } else {
        const resp = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${pagetoken}&key=${process.env.GOOGLE_PLACES_KEY}`
        );
        if (resp.data.status === "OK") {
          for (let index = 0; index < resp.data.results.length; index++) {
            const local = await Place.findOne({
              place_id: resp.data.results[index].place_id
            }).lean();
            if (!local) {
              console.log("criou");
              await Place.create({
                ...resp.data.results[index],
                latitude: lat,
                longitude: long
              });
            }
          }
        }
        return res.send(resp.data);
      }
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
