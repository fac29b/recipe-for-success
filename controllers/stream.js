const path = require("path");
const fs = require("fs");
const { OpenAI } = require("openai");
require("dotenv").config();
let streamRecipe = "Recipe:";

let url;

const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});

function getStreamRecipe(newContent) {
  if (newContent) {
    streamRecipe += newContent;
  }
  return streamRecipe;
}

async function processStream(req, res) {
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

    let prompt = generateRecipePromt(recipe_country_of_origin, is_lactose_intolerant, is_vegan, what_are_user_other_dietary_requirements);

    // console.log({ streamPrompt: prompt });

    const stream = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${prompt}`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 2000,
      stream: true,
    });

    console.log({ stream: stream.controller });

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
        // console.log(`recipe after msg created: ${getStreamRecipe(message)}`);
        messageJSON = JSON.stringify({ message });
        res.write(`data: ${messageJSON}\n\n`);
        getStreamRecipe(message);
        // console.log(`recipe after msg created: ${getStreamRecipe(message)}`);
      }
      // console.log(`recipe after msg created: ${getStreamRecipe()}`);
    }

    const imagePromise = openai.images
      .generate({
        model: "dall-e-3",
        prompt: `${streamRecipe}`,
        n: 1,
        size: "1024x1024",
      })
      .then((image) => {
        messageJSON = JSON.stringify({ image });
        res.write(`data: ${messageJSON}\n\n`);
        const folderPath = path.join(__dirname, "../public/url_folder");
        url = image.data[0].url;
        const filePath = path.join(folderPath, "../url_folder.txt");
        fs.writeFileSync(filePath, url);
      });

    const audioPromise = openai.audio.speech
      .create({
        model: "tts-1",
        voice: "alloy",
        input: `${streamRecipe}`,
      })
      .then(async (mp3) => {
        // const random = Math.random();
        // const speechFile = path.resolve(`./speech.${random}.mp3`);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const speechFile = path.resolve("./speech.mp3");
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
}

module.exports = {
  processStream,
  getStreamRecipe,
};
function generateRecipePromt(recipe_country_of_origin, is_lactose_intolerant, is_vegan, what_are_user_other_dietary_requirements) {
  return `Provide a recipe for a dish from ${recipe_country_of_origin}, taking into account the fact that I'm ${is_lactose_intolerant === "true"
      ? "lactose intolerant"
      : "not lactose intolerant"} ${is_vegan === "true" ? "vegan" : "not vegan"} and ${what_are_user_other_dietary_requirements === ""
      ? "I have no other dietary requirements"
      : what_are_user_other_dietary_requirements} `;
}

