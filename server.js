const express = require("express");
require("dotenv").config();
const { OpenAI } = require("openai");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.post("/public/server.js", (req, res) => {
  const variableFromFrontEnd = req.body.variable;
  console.log("Received variable from the front-end:", variableFromFrontEnd);
  res.json({ message: "Variable received successfully" });
});
const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});
app.get("/openai", async (req, res) => {
  let foodType = req.params.food;
  console.log(foodType);
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Provide a recipe for ${"variableFromFrontEnd"}`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 2000,
  });
  res.json(completion);
});
app.use(express.static("public"));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
