const nodemailer = require("nodemailer");

module.exports = async function email(email, text, subject) {
  let transporter = nodemailer.createTransport({
    host: "smtp.mail.ru",
    port: 2525,
    secure: false,
    auth: {
      user: "lidcode.email@mail.ru",
      pass: "QqcizWkiXqiHhbEj7r81",
    },
  });

  await transporter.sendMail({
    from: "'LidCode' <lidcode.email@mail.ru>",
    to: email,
    subject,
    text,
  });
};
