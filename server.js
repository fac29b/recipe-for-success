
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const {configuration, OpenAI } = require ('openai');
const app = express();
const bodyParser = require("body-parser");
// let path = require('path');
// const {recipeName} = require ('./public/index');


app.use(bodyParser.json());

app.post("/public/server.js", (req, res) => {
    const variableFromFrontEnd = req.body.variable;
    console.log('Received variable from the front-end:',  variableFromFrontEnd )

    res.json({ message: 'Variable received successfully' });

})



// let directories = path.dirname('..public/index.js');
// console.log(directories);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API,
});

app.get("/openai/:food", async (req, res) => {
    let foodType = req.params.food
    console.log(foodType)
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Provide a recipe for ${foodType}`
            },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 2000,
    });

    res.json(completion);
});



app.use(express.static('Public')); 
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});