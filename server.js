const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const {configuration, OpenAI } = require ('openai');
const app = express();
// let path = require('path');
// const {recipeName} = require ('./public/index');



// let directories = path.dirname('..public/index.js');
// console.log(directories);

const openai = new OpenAI({
    apiKey: process.env.openaiAPI,
});

app.get("/openai", async (req, res) => {
    console.log(req.params)
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Provide a recipe for`
            },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 2000,
    });
    res.json(completion);
});



app.use(express.static('Public')); 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});