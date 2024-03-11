const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const {configuration, OpenAI } = require ('openai');
const app = express();

// app.get('/', (req, res)=> {
//     res.send('welcome to my server!');
// });
app.use(express.static('Public')); 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});