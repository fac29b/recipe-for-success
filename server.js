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

app.get("/email", async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user: process.env.from,
      pass: process.env.third_party_app_password,
    },
  });

  if (tripleResponse && tripleResponse.text && tripleResponse.text.choices) {
    var mailOptions = {
      from: process.env.from,
      to: req.query.user_email_address,
      subject: "Your recipe from recipe-for-success dynamic app",
      text: tripleResponse.text.choices[0].message.content,
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
    // const recipeText = stream.choices[0].message.content;
    // const recipeText = stream.choices[0].message.content;

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

  // if (typeof recipe_country_of_origin === 'undefined') {
  //   res.status(400).send('Missing recipe_country_of_origin query parameter');
  //   return;
  // }

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

    console.log(finishReason);

    if (finishReason === "stop") {
      res.write("data: stop\n\n");
      res.end();
      return; // exit the fuction
    }

    if (typeof recipe_country_of_origin === "undefined") {
      res.status(400).send("Missing recipe_country_of_origin query parameter");
      return;
    } else {
      const message = chunk.choices[0]?.delta?.content || "";
      res.write(`data: ${message}\n\n`); // Send the message to the client
    }
  }
});

app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
