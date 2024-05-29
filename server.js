const express = require("express");
const path = require('path');
var nodemailer = require("nodemailer");
require("dotenv").config();
const { OpenAI } = require("openai");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.post("/server.js", (req, res) => {
  const dishCountry = req.body.recipe_country_of_origin;
  const isUserLactoseIntolerant = req.body.is_lactose_intolerant;
  res.json({
    message: `Variables ${dishCountry} and ${isUserLactoseIntolerant} received successfully`,
  });
});
const openai = new OpenAI({
  apiKey: process.env.openaiAPI,
});

let doubleResponse;

app.get("/email", async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: process.env.service,
    auth: {
      user: process.env.from,
      pass: process.env.third_party_app_password,
    },
  });

  if (doubleResponse && doubleResponse.text && doubleResponse.text.choices) {
    var mailOptions = {
      from: process.env.from,
      to: req.query.user_email_address,
      subject: "Your recipe from recipe-for-success dynamic app",
      text: doubleResponse.text.choices[0].message.content,
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

app.get("/openai", async (req, res) => {
  const {
    recipe_country_of_origin,
    is_lactose_intolerant,
    is_vegan,
    what_are_user_other_dietary_requirements,
  } = req.query;
  try {
    console.log(
      { recipe_country_of_origin },
      { is_lactose_intolerant },
      { is_vegan },
      { what_are_user_other_dietary_requirements }
    );

    const prompt = `Provide a recipe for a dish from ${recipe_country_of_origin}, taking into account the fact that I'm ${
      is_lactose_intolerant === "true"
        ? "lactose intolerant"
        : "not lactose intolerant"
    } ${is_vegan === "true" ? "vegan" : "not vegan"} and ${
      what_are_user_other_dietary_requirements === ""
        ? "I have no other dietary requirements"
        : what_are_user_other_dietary_requirements
    } `;

    console.log(prompt);

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


    const recipeImagePrompt = completion.choices[0].message.content;

    
   
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${recipeImagePrompt}`,
      n: 1,
      size: "1024x1024",
    });



 

  const assistant = await openai.beta.assistants.create({
    name: "Cuisine expert",
    instructions: "You are one of the best chefs in the world. Write and run code to help user with their question.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o"
  });

  const thread = await openai.beta.threads.create();


  const message = await openai.beta.threads.messages.create(
    thread.id,
    {
      role: "user",
      content: "I've got some tomatoes, onions, and some beef. What can I cook?"
    }
  );

  // We use the stream SDK helper to create a run with
// streaming. The SDK provides helpful event listeners to handle 
// the streamed response.
 
const run = openai.beta.threads.runs.stream(thread.id, {
  assistant_id: assistant.id
})
  .on('textCreated', (text) => process.stdout.write('\nassistant > '))
  .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
  .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
  .on('toolCallDelta', (toolCallDelta, snapshot) => {
    if (toolCallDelta.type === 'code_interpreter') {
      if (toolCallDelta.code_interpreter.input) {
        process.stdout.write(toolCallDelta.code_interpreter.input);
      }
      if (toolCallDelta.code_interpreter.outputs) {
        process.stdout.write("\noutput >\n");
        toolCallDelta.code_interpreter.outputs.forEach(output => {
          if (output.type === "logs") {
            process.stdout.write(`\n${output.logs}\n`);
          }
        });
      }
    }
  });

 







    // const threadId = 'thread_8f0SOguFBVyGGLP7Np8lyvzK'


    //   const messageThread = await openai.beta.threads.create( threadId, {
    //     messages: [
    //       {
    //         role: "user",
    //         content: "I'm need help with cooking. Would you be my cooking adviser?"
    //       },
    //     ],
    //   });

    //   const messages = await openai.beta.threads.messages.list(threadId)

    //   const run = await openai.beta.threads.runs.retrieve(threadId)
    
    //   console.log({messageThread}, {messages}, {run});
  




    doubleResponse = {
      text: completion,
      image: imageResponse,
    };
    res.json(doubleResponse);
  } catch (error) {
    console.error("An error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//   const dishCountry = req.body.recipe_country_of_origin;
//   const isUserLactoseIntolerant = req.body.is_lactose_intolerant;

//   res.json({
//     message: `Variables ${dishCountry} and ${isUserLactoseIntolerant} received successfully`,
//   });
// });

app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
