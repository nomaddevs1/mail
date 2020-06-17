const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const mailer = require("../middleware/mail");
const { User, validation, validateLogin } = require("../model/user");

//creating a verification token  that is send to the user via mail attached to the main url
function verifyUser({ email }) {
  //verification token is created
  const verifyToken = jwt.sign(
    { email: email, verify: "User is ready to be verified" },
    process.env.JWT_SECRET,
    {
      expiresIn: 7200, // in seconds
    }
  );
  return verifyToken;
}

//signup route
router.post("/signup", async (req, res) => {
  const { error } = validation(req.body);
  if (error) return res.status(401).send(error.details[0].message);

  const { name, confirmPassword, password, email } = req.body;

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.send("Email already exists");

  //name, email, password, confirmPassword,
  const token = verifyUser(req.body);
  //checking if password and the confirmPassword are the same
  if (confirmPassword === password) {
    //hashed password to be generated and stored in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //saving the info in the database
    user = await new User({
      name,
      password: hashedPassword,
      username: email,
      verification_token: token,
    });
    //the return data sent by our database
    const result = await user.save();

    const message = `<h2>Please verify your mail by clicking on this link http://localhost:3000/verify/${token}<h2>`;
    const mail = mailer(message, email, "Verification");

    res.json({
      mail,
      result,
    });
  } else {
    res.send("Password doesn't match");
  }
});

router.get("/newToken", (req, res) => {
  const token = verifyUser(req.body);
  const message = `<h2>Your new verifiction token http://localhost:3000/verify/${token}<h2>`;
  mailer(message, req.body.email, "Verification");
  res.send("a new token has been sent");
});

router.get("/verify/:token", async (req, res) => {
  const verify = req.params.token;

  if (verify) {
    const token = jwt.verify(`${verify}`, process.env.JWT_SECRET);
    console.log(token.email);
    if (token) {
      let user = await User.findOneAndUpdate(
        {
          username: token.email,
        },
        {
          isVerified: true,
          verification_token: undefined,
        }
      );

      console.log(user);
      await user.save();
      res.send("Thank you for verifying your account. you can login now");
    } else {
      res.send("Invalid token. You can request another token");
    }
  } else {
    res.send("Something went wrong!");
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const { error } = validateLogin(req.body);
  if (error) return res.status(403).send(error.details[0].message);

  const user = await User.findOne({ username: req.body.username });

  if (user) {
    if (user.isVerified) {
      const passValid = await bcrypt.compare(req.body.password, user.password);
      if (!passValid)
        return res.status(400).send("Invalid Username or Password");

      var token = jwt.sign({ id: user._id, email: user.email }, "secret", {
        expiresIn: 10080, // in seconds
      });

      res.header("Authorization", `Bearer ${token}`).json({
        success: true,
        message: "Successfully created new user.",
        token: `token: bearer ${token}`,
      });
    } else {
      const message = `<h2>Please verify your mail by clicking on this link http://localhost:3000/verify/${token}<h2>`;
      mailer(message, email, "Verification");
      res.send(
        "You are not yet a valid user. You can login by verifying your email. A new message has been sent to your mail"
      );
    }
  } else {
    res.send("User is not available on database");
  }
});

module.exports = router;
