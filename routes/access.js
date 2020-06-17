const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get(
  "/dashboard",

  (req, res, next) => {
    console.log(req.user);
    res.send("It worked! User id is: " + req.user + ".");
  }
);

module.exports = router;
