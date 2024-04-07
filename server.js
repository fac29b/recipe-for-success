const express = require("express");
require("dotenv").config();
const { OpenAI } = require("openai");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.post("/public/server.js", (req, res) => {
  const variableFromFrontEnd = req.body.variable;
  const variableFromFrontEnd2= req.body.variable2
  console.log("Received variable from the front-end:", variableFromFrontEnd);
  console.log("Received boolean from front-end:", variableFromFrontEnd2);
  res.json({ message: "Variable received successfully" });
});
const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});
app.get("/openai", async (req, res) => {
  const recipeFromFrontEnd = req.query.recipe;
  const isLactoseIntolerant = req.query.lactose
  console.log({isLactoseIntolerant}, {recipeFromFrontEnd})


  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Provide a recipe for ${recipeFromFrontEnd} the user is lactose intolerant ${isLactoseIntolerant === false ? "no" : "yes"}`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 2000,
  });
  res.json(completion);
  console.log({lactoseBoolean: isLactoseIntolerant}, {recipeFromFrontEnd})
});
app.use(express.static("public"));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
