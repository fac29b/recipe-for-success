const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const {configuration, OpenAI } = require ('openai');
const app = express();

// const openai = new OpenAI({
//     apiKey: process.env.openaiAPI,
// });

app.get("/openai", async (req, res) => {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Create a recipe`
            },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 2000,
    });
    res.json(completion);
     console.log(completion);
});

// app.get('/', (req, res)=> {
//     res.send('welcome to my server!');
// });

app.use(express.static('Public')); 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});