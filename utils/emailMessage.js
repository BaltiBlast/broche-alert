// -------------------------------------------------------------------------------------------------------------------- //
// ===== IMPORTS ===== //
// npm
require("dotenv").config();

const { GOOGLE_EMAIL_ADRESS } = process.env;

const emailMessage = {
  // -------------------------------------------------------------------------------------------------------------------- //
  // WELCOME EMAIL- {return object}
  welcomeEmail: (firstname, userEmail, contactpath) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Broche tools</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f8f9fa;
          color: #333;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007bff;
        }
        p {
          margin-bottom: 20px;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hi <strong>${firstname}</strong>!</p>
        <p>Just a message to confirm your subscription to <em>Broche tools</em>. The site is new and I've got lots of ideas for the future! If you see any areas for improvement, don't hesitate to contact me via the <a href=${contactpath}>Contact section</a> of the site, I'll be happy to listen!</p>
        <p>I'm working alone on this site, but I'll always take the time to read anyone who wants to exchange ideas.</p>
        <p>See you soon!</p>
      </div>
    </body>
    </html>
    `;

    return {
      from: GOOGLE_EMAIL_ADRESS,
      to: userEmail,
      subject: "Welcome to Broche tools!",
      text: `Hi ${firstname} ! Just a message to confirm your subscription to Broche tools.  The site is new and I've got lots of ideas for the future! If you see any areas for improvement, don't hesitate to contact me via the Contact section of the site, I'll be happy to listen!
    I'm working alone on this site, but I'll always take the time to read anyone who  wants to exchange ideas.
    
    See you soon!`,
      html: htmlTemplate,
    };
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // RESET PASSWORD EMAIL- {return object}
  resetPasswordEmail: (firstname, userEmail, resetLink, expirationDate) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f8f9fa;
          color: #333;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007bff;
        }
        p {
          margin-bottom: 20px;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hi <strong>${firstname}</strong>!</p>
        <p>Click on the link below to reset your password.</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>You have until <strong>${expirationDate}</strong> to change your password.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    </body>
    </html>
    `;

    return {
      from: GOOGLE_EMAIL_ADRESS,
      to: userEmail,
      subject: "Reset your password",
      text: `Hi ${firstname} ! Click on the link below to reset your password. ${resetLink} If you did not request a password reset, you can ignore this email.`,
      html: htmlTemplate,
    };
  },

  // -------------------------------------------------------------------------------------------------------------------- //
  // CONTACT EMAIL - {return object}
  contactEmail: (email, message, subject) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contact message</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f8f9fa;
          color: #333;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007bff;
        }
        p {
          margin-bottom: 20px;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Message reçu pour : ${subject}</h1>
        <p>Message de : ${email}</p>
        <p>${message}</p>
      </div>
    </body>
    </html>
    `;

    return {
      from: GOOGLE_EMAIL_ADRESS,
      to: GOOGLE_EMAIL_ADRESS,
      subject: subject,
      text: message,
      html: htmlTemplate,
    };
  },
};

module.exports = emailMessage;
