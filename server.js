const express = require("express");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { OpenAI } = require("openai");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
let doubleResponse;

app.use(bodyParser.json());
app.post("/server.js", (req, res) => {
  const dishCountry = req.body.recipe_country_of_origin;
  const isUserLactoseIntolerant = req.body.is_lactose_intolerant;
  res.json({
    message: `Variables ${dishCountry} and ${isUserLactoseIntolerant} received successfully`,
  });
});
const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});
app.get("/email", async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user: process.env.from,
      pass: process.env.third_party_app_password,
    },
  });


  const folderPath = path.join(__dirname, "./public/url_folder");
  const url = doubleResponse.image.data[0].url;
  const filePath = path.join(folderPath, "url_folder.txt");
  fs.writeFileSync(filePath, url);




  var mailOptions = {
    from: process.env.from,
    to: req.query.user_email_address,
    subject: "Your recipe from recipe-for-success dynamic app",
    html: `${doubleResponse.text.choices[0].message.content} Embedded image: <img class="user-img" src="${url}"/>`,
    attachments: [
      {
        filename: "url_folder.txt",
        path: path.join(__dirname, "/public/url_folder/url_folder.txt"),
        cid: "url",
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});

app.get("/openai", async (req, res) => {
  console.log(req.query);
  try {
    console.log(
      { country: req.query.recipe_country_of_origin },
      { lactose_intolerant: req.query.is_lactose_intolerant },
      { is_vegan: req.query.is_vegan },
      {
        user_otherdietary_requirements:
          req.query.what_are_user_other_dietary_requirements,
      },
      { I_do_not_eat: req.query.I_do_not_eat }
    );

    const prompt = `Provide a recipe for a dish from ${
      req.query.recipe_country_of_origin
    }, taking into account the fact that I'm ${
      req.query.is_lactose_intolerant === "true"
        ? "lactose intolerant"
        : "not lactose intolerant"
    } ${req.query.is_vegan === "true" ? "vegan" : "not vegan"} and ${
      req.query.what_are_user_other_dietary_requirements === ""
        ? "I have no other dietary requirements"
        : `${req.query.I_do_not_eat}${req.query.what_are_user_other_dietary_requirements}`
    } `;

    console.log(prompt);

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${prompt}`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 2000,
    });
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    doubleResponse = {
      text: completion,
      image: imageResponse,
    };
    console.log(doubleResponse.text.choices);
    res.json(doubleResponse);
  } catch (error) {
    console.error("An error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static("public"));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
