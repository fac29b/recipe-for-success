const express = require("express");
const fs = require("fs");
const path = require("path");
var nodemailer = require("nodemailer");
const { OpenAI } = require("openai");
const app = express();
app.use(express.json());
const bodyParser = require("body-parser");

require("dotenv").config();

app.use(bodyParser.json({limit: "100mb"}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit:50000}));

const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});

let recipe = "";
let url;

app.get("/stream", async (req, res) => {
  try {
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

    // console.log({ streamPrompt: prompt });

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

    console.log({stream: stream.controller})

 

    for await (const chunk of stream) {
      const finishReason = chunk.choices[0].finish_reason;

      if (finishReason === "stop") {
        console.log("finished generating recipe");
        // console.log(`recipie=${recipe}`);
        break;
      }

      if (typeof recipe_country_of_origin === "undefined") {
        res
          .status(400)
          .send("Missing recipe_country_of_origin query parameter");
        return;
      } else {
        const message = chunk.choices[0]?.delta?.content || "";
        recipe += message;
        messageJSON = JSON.stringify({ message });
        res.write(`data: ${messageJSON}\n\n`);
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
        res.write(`data: ${messageJSON}\n\n`);
        const folderPath = path.join(__dirname, "./public/url_folder");
        url = image.data[0].url;
        const filePath = path.join(folderPath, "url_folder.txt");
        fs.writeFileSync(filePath, url);
      });

    const audioPromise = openai.audio.speech
      .create({
        model: "tts-1",
        voice: "alloy",
        input: `${recipe}`,
      })
      .then(async (mp3) => {
        const speechFile = path.resolve("./speech.mp3");
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        messageJSON = JSON.stringify({ audio: buffer.toString("base64") });
        res.write(`data: ${messageJSON}\n\n`);
      });

    return Promise.all([imagePromise, audioPromise]).then(() => {
      messageJSON = JSON.stringify({ message: "stop" });
      res.write(`data: ${messageJSON}\n\n`);
      res.end();
    });
  } catch (error) {
    if (error.code === "invalid_api_key") {
      let errorMessage = error.code;
      let errorJSON = JSON.stringify({ errorMessage });
      res.write(`data: ${errorJSON}\n\n`);
      console.error("Invalid API key provided. Please check your API key.");
    } else {
      console.error("An error occurred:", error.message);
    }

    console.log("error");
  }
});

app.get("/email", async (req, res) => {
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
          path: path.join(__dirname, "/public/url_folder/url_folder.txt"),
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
});


app.post("/upload", async (req, res) => {
  const picture = req.body.image;
  console.log({ josue_upload: picture });
  // res.status(200).json({ message: `variable ${JSON.stringify(picture)} received` });



  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What’s in this image?" },
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
  console.log(response.choices[0]);
  res.send(response.choices[0])
  // res.response.choices[0]

});

app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
