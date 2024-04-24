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
  try {
  const recipeCountryOfOrigin = req.query.recipe_country_of_origin;
  const isLactoseIntolerant = req.query.is_lactose_intolerant;
  const isVegan = req.query.is_vegan; 
  const hasOtherdietaryRequirements = req.query.has_other_dietary_requirements;

  console.log(hasOtherdietaryRequirements)



  const prompt = `Provide a recipe for a dish from ${recipeCountryOfOrigin}, taking into account the fact that the user is ${
    isLactoseIntolerant === "true" ? "lactose intolerant" : "not lactose intolerant" 
  } and ${isVegan === "true" ? "vegan" : "not vegan"
  }`

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
  

const doubleResponse = {
  text: completion,
  image: imageResponse
}
res.json(doubleResponse);


console.log({ isLactoseIntolerant }, { recipeCountryOfOrigin }, { isVegan });


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

