const assert = require("assert");
const generateRecipePrompt = require("/stream.js");

// Test case 1: All parameters are provided
assert.strictEqual(
  generateRecipePrompt("Italy", "true", "false", "no dietary requirements"),
  "Provide a recipe for a dish from Italy, taking into account the fact that I'm lactose intolerant not vegan and no dietary requirements"
);

// Test case 2: No dietary requirements
assert.strictEqual(
  generateRecipePrompt("Mexico", "false", "true", ""),
  "Provide a recipe for a dish from Mexico, taking into account the fact that I'm not lactose intolerant or vegan and I have no other dietary requirements"
);

// Test case 3: Only country of origin is provided
assert.strictEqual(
  generateRecipePrompt("India", "false", "false", ""),
  "Provide a recipe for a dish from India, taking into account the fact that I'm not lactose intolerant not vegan and I have no other dietary requirements"
);

// Test case 4: All parameters are empty
assert.strictEqual(
  generateRecipePrompt("", "", "", ""),
  "Provide a recipe for a dish from , taking into account the fact that I'm not lactose intolerant not vegan and I have no other dietary requirements"
);

console.log("All test cases passed!");
