
const path = require("path");
const fs = require("fs");
const { OpenAI } = require("openai");
require("dotenv").config();
let recipe = "Recipe:"
let url

console.log(` server.js file value of recipe is: ${recipe}`)


const openai = new OpenAI({
    apiKey: process.env.openaiAPI,
  });



// async function processEmail(req, res) {
//     var transporter = nodemailer.createTransport({
//       service: process.env.service,
//       auth: {
//         user: process.env.from,
//         pass: process.env.third_party_app_password,
//       },
//     });
  
//     const emailDocument = `
//     <html>
//       <head>
//         <style>
//           .preserve-line-breaks {
//             white-space: pre-line
//           }
//           .user-img {
//             width: 200px;
//             height: 200px;
//           }
//         </style>
//       </head>
//       <body class="preserve-line-breaks" >
//         ${recipe}
//         <br />
//          Embedded image:
//         <br /> 
//         <img class="user-img" src="${url}"/>
//       </body>
//     </html>
//   `;
  
//     if (recipe !== "") {
//       var mailOptions = {
//         from: process.env.from,
//         to: req.query.user_email_address,
//         subject: "Your recipe from recipe-for-success dynamic app",
//         text: recipe,
//         html: emailDocument,
//         attachments: [
//           {
//             filename: "url_folder.txt",
//             path: path.join(__dirname, "../public/url_folder/url_folder.txt"),
//             cid: "url",
//           },
//         ],
//       };
//     } else {
//       console.log("doubleResponse is not defined yet.");
//     }
  
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });
//   }

  async function processUpload(req, res) {
    const picture = req.body.image;
    console.log({ josue_upload: picture });
    // res.status(200).json({ message: `variable ${JSON.stringify(picture)} received` });
  
  
  
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What can I cook with these ingredients?" },
            {
              type: "image_url",
              image_url: {
                url: picture,
              },
            },
          ],
        },
      ],
    });
  
    recipe = response.choices[0].message.content
 
    console.log(`your recipe is ${recipe}`);
    res.send(response.choices[0]);
   
  
  }




module.exports = {
    processUpload,
}
