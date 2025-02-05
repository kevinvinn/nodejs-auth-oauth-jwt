const nodemailer = require("nodemailer");

const Dotenv = require("dotenv");
const dotenv = Dotenv.config();

class Mailer {
  static sendEmail(mailOptions) {
    const { EMAIL_USER, EMAIL_PASS } = process.env;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        throw err;
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
  }
}

module.exports = Mailer;
