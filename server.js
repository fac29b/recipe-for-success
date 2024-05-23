const express = require("express");
const fs = require("fs");

const path = require('path');
var nodemailer = require("nodemailer");
require("dotenv").config();
const { OpenAI } = require("openai");
const app = express();
const bodyParser = require("body-parser");
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

let doubleResponse;

app.get("/email", async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user: process.env.from,
      pass: process.env.third_party_app_password,
    },
  });

  if (doubleResponse && doubleResponse.text && doubleResponse.text.choices) {
    var mailOptions = {
      from: process.env.from,
      to: req.query.user_email_address,
      subject: "Your recipe from recipe-for-success dynamic app",
      text: doubleResponse.text.choices[0].message.content,
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
});

app.get("/openai", async (req, res) => {
  const {
    recipe_country_of_origin,
    is_lactose_intolerant,
    is_vegan,
    what_are_user_other_dietary_requirements,
  } = req.query;
  try {
    console.log(
      { recipe_country_of_origin },
      { is_lactose_intolerant },
      { is_vegan },
      { what_are_user_other_dietary_requirements }
    );

    const prompt = `Provide a recipe for a dish from ${recipe_country_of_origin}, taking into account the fact that I'm ${
      is_lactose_intolerant === "true"
        ? "lactose intolerant"
        : "not lactose intolerant"
    } ${is_vegan === "true" ? "vegan" : "not vegan"} and ${
      what_are_user_other_dietary_requirements === ""
        ? "I have no other dietary requirements"
        : what_are_user_other_dietary_requirements
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


    console.log(completion.choices[0].message.content)

    

    app.get("/audio", async (req, res) => {
      console.log(req.query)
      async function main() {
        const recipe = completion.choices[0].message.content; 
        const speechFile = path.resolve("./speech.mp3");
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: "alloy",
          input: `${recipe}`,
        });
        console.log(speechFile);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer); 
        res.sendFile(path.join(__dirname, "speech.mp3")); 
      }
    
      try {
        await main();
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
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
      // audio: buf.toString('base64'),
    };
    res.json(doubleResponse);
  } catch (error) {
    console.error("An error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//   const dishCountry = req.body.recipe_country_of_origin;
//   const isUserLactoseIntolerant = req.body.is_lactose_intolerant;

//   res.json({
//     message: `Variables ${dishCountry} and ${isUserLactoseIntolerant} received successfully`,
//   });
// });

app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
