const nodemailer = require("nodemailer");
const recipeFromStream = require("./stream.js");
const path = require("path");

let recipe = recipeFromStream.getStreamRecipe();
let url = recipeFromStream.url

async function processEmail(req, res) {
    var transporter = nodemailer.createTransport({
      service: process.env.service,
      auth: {
        user: process.env.from,
        pass: process.env.third_party_app_password,
      },
    });
  
    const emailDocument = `
    <html>
      <head>
        <style>
          .preserve-line-breaks {
            white-space: pre-line
          }
          .user-img {
            width: 200px;
            height: 200px;
          }
        </style>
      </head>
      <body class="preserve-line-breaks" >
        ${recipe}
        <br />
         Embedded image:
        <br /> 
        <img class="user-img" src="${url}"/>
      </body>
    </html>
  `;
  
    if (recipe !== "") {
      var mailOptions = {
        from: process.env.from,
        to: req.query.user_email_address,
        subject: "Your recipe from recipe-for-success dynamic app",
        text: recipe,
        html: emailDocument,
        attachments: [
          {
            filename: "url_folder.txt",
            path: path.join(__dirname, "../public/url_folder/url_folder.txt"),
            cid: "url",
          },
        ],
      };
    } else {
      console.log("doubleResponse is not defined yet.");
    }
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }


  module.exports = {
    processEmail
  }