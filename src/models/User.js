const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name required."] },
  password: {
    type: String,
    select: false
  },
  email: {
    type: String,
    required: [true, "Email required."],
    unique: true,
    lowercase: true
  },
  type: { type: String, required: true, default: "user" },
  state: mongoose.Schema.Types.Mixed,
  nickname: String,
  phone: String,
  city: String,
  cpf: String,
  gender: String,
  age: Number,
  avatar: String,
  ip: mongoose.Schema.Types.Mixed,
  provider: {
    type: String,
    required: true,
    enum: ["google", "facebook", "default"]
  },
  facebookProvider: {
    type: {
      id: String,
      token: String
    },
    select: false
  },
  googleProvider: {
    type: {
      id: String,
      token: String
    },
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.set("toJSON", { getters: true, virtuals: true });

UserSchema.pre("save", async function(next) {
  if (this.password) {
    const hash = await bcrypt.hash(this.password, 15);
    this.password = hash;
  }

  next();
});

UserSchema.statics.upsertFbUser = function(
  accessToken,
  refreshToken,
  profile,
  cb
) {
  var that = this;
  return this.findOne(
    {
      "facebookProvider.id": profile.id
    },
    function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "facebook",
          avatar: profile.photos[0].value,
          facebookProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    }
  );
};

UserSchema.statics.upsertGoogleUser = function(
  accessToken,
  refreshToken,
  profile,
  cb
) {
  var that = this;
  return this.findOne(
    {
      "googleProvider.id": profile.id
    },
    function(err, user) {
      // no user was found, lets create a new one
      if (!user) {
        var newUser = new that({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile._json.picture,
          provider: "google",
          googleProvider: {
            id: profile.id,
            token: accessToken
          }
        });

        newUser.save(function(error, savedUser) {
          if (error) {
            console.log(error);
          }
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    }
  );
};

exports.model = mongoose.model("User", UserSchema);
exports.schema = UserSchema;
