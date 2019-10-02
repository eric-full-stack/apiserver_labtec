const routes = require("express").Router();
const authUserMiddleware = require("./middlewares/authUser");
const passport = require("passport");
require("./middlewares/passport")();

const UserController = require("./controllers/UserController");
const PlaceController = require("./controllers/PlaceController");
const VoteController = require("./controllers/VoteController");
const CommentController = require("./controllers/CommentController");

//USER ROUTES
routes.post(
  "/authenticate/google",
  passport.authenticate("google-token", { session: false }),
  UserController.authenticateGoogle
);
routes.post(
  "/authenticate/facebook",
  passport.authenticate("facebook-token", { session: false }),
  UserController.authenticateFacebook
);
routes.post("/authenticate/default", UserController.authenticateDefault);
routes.post("/user", UserController.register);
routes.get("/nearbySearch", PlaceController.nearbySearch);
routes.get("/textSearch", PlaceController.textSearch);
routes.get("/places/:id", PlaceController.view);

//USER NEEDED TO BE SIGN IN
routes.use(authUserMiddleware);

//USERS ROUTES
routes.patch("/users/:id", UserController.update); //NEED DATA(USER SCHEMA)
routes.patch("/users/:id/password", UserController.updatePassword); //NEED NEWPASSWORD
//ARTICLES ROUTES
routes.post("/votes/:id/", VoteController.create);
routes.patch("/votes/:id/", VoteController.update);
routes.get("/votes", VoteController.index);
routes.delete("/votes/:id/", VoteController.delete);

//COMMENTS ROUTES
routes.post("/comments", CommentController.create); //NEED TEXT, ARTICLE(ID), COMMENTID(FK OPTIONAL)
routes.patch("/comments/:id", CommentController.update); //NEED COMMENT(TEXT),  ARTICLE(ID)
routes.delete("/comments/:id", CommentController.delete); // ID = COMMENT ID
routes.get("/comments/:id", CommentController.getByPlace); // ID = PLACEID

module.exports = routes;
