const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const morgan = require("morgan");
const app = express();
require("express-async-errors");
require("dotenv/config");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(cors());

require("./middleware/passport-jwt")(passport);

mongoose.connect(process.env.mongourl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("Database running");
});
db.on("error", (err) => {
  console.log(err);
});

app.use("/auth", require("./routes/user"));
app.use(
  "/",
  passport.authenticate("jwt", { session: false }),
  require("./routes/access")
);
app.use(require("./middleware/errors"));
app.listen("3900", () => {
  console.log("Server running");
});
