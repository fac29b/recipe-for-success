
const express = require("express");
const fs = require("fs");
const path = require("path");
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

let tripleResponse;
let recipe = "";



app.get("/openai", async (req, res) => {
  const {
    recipe_country_of_origin,
    is_lactose_intolerant,
    is_vegan,
    what_are_user_other_dietary_requirements,
  } = req.query;

  console.log({ test: recipe_country_of_origin });

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

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    const speechFile = path.resolve("./speech.mp3");

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: `${prompt}`,
    });
    console.log(speechFile);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    tripleResponse = {
      text: prompt,
      image: imageResponse,
      audio: buffer.toString("base64"),
    };

    res.json(tripleResponse);
  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    console.log("finally");
  }
});

app.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const {
    recipe_country_of_origin,
    is_lactose_intolerant,
    is_vegan,
    what_are_user_other_dietary_requirements,
  } = req.query;



  let prompt = `Provide a recipe for a dish from ${recipe_country_of_origin}, taking into account the fact that I'm ${
    is_lactose_intolerant === "true"
      ? "lactose intolerant"
      : "not lactose intolerant"
  } ${is_vegan === "true" ? "vegan" : "not vegan"} and ${
    what_are_user_other_dietary_requirements === ""
      ? "I have no other dietary requirements"
      : what_are_user_other_dietary_requirements
  } `;

  console.log({ streamPrompt: prompt });

  const stream = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${prompt}`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 500,
    stream: true,
  });



  for await (const chunk of stream) {
    const finishReason = chunk.choices[0].finish_reason;

   

    if (finishReason === "stop") {
      console.log("finished generating recipe");
      console.log(`recipie=${recipe}`);
      break;
    }

    if (typeof recipe_country_of_origin === "undefined") {
      res.status(400).send("Missing recipe_country_of_origin query parameter");
      return;
    } else {
      const message = chunk.choices[0]?.delta?.content || "";
      recipe += message;
      messageJSON = JSON.stringify({ message });
      res.write(`data: ${messageJSON}\n\n`); // Send the message to the client
    }
  }

  const imagePromise = openai.images
    .generate({
      model: "dall-e-3",
      prompt: `${recipe}`,
      n: 1,
      size: "1024x1024",
    })
    .then((image) => {
      messageJSON = JSON.stringify({ image });
      res.write(`data: ${messageJSON}\n\n`); // Send the message to the client
    });

  const audioPromise = openai.audio.speech
    .create({
      model: "tts-1",
      voice: "alloy",
      input: `${recipe}`,
    })
    .then(async (mp3) => {
      const speechFile = path.resolve("./speech.mp3");
      console.log(speechFile);
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);
      messageJSON = JSON.stringify({ audio: buffer.toString("base64") });
      res.write(`data: ${messageJSON}\n\n`); // Send the message to the client
    });

  return Promise.all([imagePromise, audioPromise]).then(() => {
    messageJSON = JSON.stringify({ message: "stop" });
    res.write(`data: ${messageJSON}\n\n`); // Send the message to the client
    res.end();
  });
});

app.get("/email", async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user: process.env.from,
      pass: process.env.third_party_app_password,
    },
  });

  if (recipe !== "") {
    var mailOptions = {
      from: process.env.from,
      to: req.query.user_email_address,
      subject: "Your recipe from recipe-for-success dynamic app",
      text: recipe,
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

app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
