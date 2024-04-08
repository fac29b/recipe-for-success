const express = require("express");
require("dotenv").config();
const { OpenAI } = require("openai");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.post("/public/server.js", (req, res) => {
  const dishCountry = req.body.dishOriginCountry;
  const isUserLactoseIntolerant = req.body.isLactoseIntolerant;
  res.json({
    message: `Variables ${dishCountry} and ${isUserLactoseIntolerant} received successfully`,
  });
});
const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});
app.get("/openai", async (req, res) => {
  const recipeCountryOfOrigin = req.query.recipe_country_of_origin;
  const isLactoseIntolerant = req.query.is_lactose_intolerant;
  console.log({ isLactoseIntolerant}, {recipeCountryOfOrigin  });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Provide a recipe for a dish from ${recipeCountryOfOrigin}, taking into account the fact that the user is ${
          isLactoseIntolerant ? "lactose intolerant" : "not lactose intolerant"
        }`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 2000,
  });
  res.json(completion);
  console.log({ lactoseBoolean: isLactoseIntolerant }, {recipeCountryOfOrigin });
});
app.use(express.static("public"));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
