const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "303923c6dc5733",
      pass: "a5154ac17bc751",
    },
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    service: process.env.SMPT_SERVICE,
  });

  const mailOptions = {
    from: "303923c6dc5733",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
