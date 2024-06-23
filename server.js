const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const recipeContoller = require("./controllers/recipes.js")

app.get("/stream", recipeContoller.processStream);
app.get("/email", recipeContoller.processEmail);
app.post("/upload", recipeContoller.processUpload);

app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
