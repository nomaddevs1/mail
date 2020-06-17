const nodemailer = require("nodemailer");

module.exports = function mailer(message, to, subject) {
  let transporter = nodemailer.createTransport({
    port: 587,
    host: "smtp.aol.com",
    auth: {
      service: "aol",
      user: "farouqsiwoku@aol.com",
      pass: "xhvb fcpy zrsa msbx",
    },
  });

  let mailOptions = {
    from: "farouqsiwoku@aol.com",
    to,
    subject,
    html: message,
  };

  transporter
    .sendMail(mailOptions)
    .then((info) => {
      return `Email sent: ${info.response}`;
    })
    .catch((err) => {
      return err;
    });
};
