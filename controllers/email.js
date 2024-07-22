const nodemailer = require("nodemailer");
const recipeFromStream = require("./stream.js");
const path = require("path");


async function processEmail(req, res) {
  console.log(`is picked up ${req.body.pictureSectionText}`)
  let recipe = recipeFromStream.getStreamRecipe();
  // let recipe = recipeFromStream.getStreamRecipe() !== "" ? recipeFromStream.getStreamRecipe() : req.body.pictureSectionText;
  // let recipe = req.body.pictureSectionText !== "" ? req.body.pictureSectionText : recipeFromStream.getStreamRecipe() ;
  let url = recipeFromStream.getUrl();
  console.log(`email.js file ${url}`)
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
  
    // if (recipe !== "") {
      var mailOptions = {
        from: process.env.from,
        to: req.query.user_email_address,
        subject: " Your recipe from recipe-for-success dynamic app",
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
    // } else {
    //   console.log("doubleResponse is not defined yet.");
    // }
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).json({emailStatus: info.response});
        console.log(error);
      } else {
        res.status(250).json({emailStatus: info.response});
        console.log("Email sent: " + info.response);
      }
    });

    console.log(`user recipe ${recipe}`);
    recipe = "Empty string";
    console.log(recipe)
    
  }

  module.exports = {
    processEmail
  }