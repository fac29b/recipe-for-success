// variables 

const CACHE_NAME_URL = "image-cache-v1";
const CACHE_NAME_AUDIO = "audio-cache-v2";
let audioElement = new Audio();
let alert_message = "an email has been sent your inbox"







const defaultRecipe = `
Apologies, but our AI Recipe-Making expert is unavailable. Please try again later. In the meantime, please find one of our favourite recipes below.

  <h2>Ingredients</h2>
  <ul>
    <li>1 tbsp olive oil</li>
    <li>4 rashers smoked streaky bacon, finely chopped</li>
    <li>2 medium onions, finely chopped</li>
    <li>2 carrots, trimmed and finely chopped</li>
    <li>2 celery sticks, finely chopped</li>
    <li>2 garlic cloves finely chopped</li>
    <li>2-3 sprigs rosemary leaves picked and finely chopped</li>
    <li>500g beef mince</li>
  </ul>
  
  <h2>For the Bolognese Sauce</h2>
  <ul>
    <li>2 x 400g tins plum tomatoes</li>
    <li>Small pack basil leaves picked, ¾ finely chopped and the rest left whole for garnish</li>
    <li>1 tsp dried oregano</li>
    <li>2 fresh bay leaves</li>
    <li>2 tbsp tomato purée</li>
    <li>1 beef stock cube</li>
    <li>1 red chilli deseeded and finely chopped (optional)</li>
    <li>125ml red wine</li>
    <li>6 cherry tomatoes sliced in half</li>
  </ul>
  
  <h2>To Season and Serve</h2>
  <ul>
    <li>75g parmesan grated, plus extra to serve</li>
    <li>400g spaghetti</li>
    <li>Crusty bread to serve (optional)</li>
  </ul>
  
  <h2>Method</h2>
  <ol>
    <li>Put a large saucepan on a medium heat and add 1 tbsp olive oil.</li>
    <li>Add 4 finely chopped bacon rashers and fry for 10 mins until golden and crisp.</li>
    <li>Reduce the heat and add the 2 onions, 2 carrots, 2 celery sticks, 2 garlic cloves and the leaves from 2-3 sprigs rosemary, all finely chopped, then fry for 10 mins. Stir the veg often until it softens.</li>
    <li>Increase the heat to medium-high, add 500g beef mince and cook stirring for 3-4 mins until the meat is browned all over.</li>
    <li>Add 2 tins plum tomatoes, the finely chopped leaves from ¾ small pack basil, 1 tsp dried oregano, 2 bay leaves, 2 tbsp tomato purée, 1 beef stock cube, 1 deseeded and finely chopped red chilli (if using), 125ml red wine and 6 halved cherry tomatoes. Stir with a wooden spoon, breaking up the plum tomatoes.</li>
    <li>Bring to the boil, reduce to a gentle simmer and cover with a lid. Cook for 1 hr 15 mins stirring occasionally, until you have a rich, thick sauce.</li>
    <li>Add the 75g grated parmesan, check the seasoning and stir.</li>
    <li>When the bolognese is nearly finished, cook 400g spaghetti following the pack instructions.</li>
    <li>Drain the spaghetti and either stir into the bolognese sauce, or serve the sauce on top. Serve with more grated parmesan, the remaining basil leaves and crusty bread, if you like.</li>
  </ol>
`;




// functions

function playAudio(element) {
  element.play();
}

function pauseAudio(element) {
  element.pause();
}

function stopAudio(element) {
  element.stop();
}

function createQuery(myObject) {
  let esc = encodeURIComponent;
  let query = Object.keys(myObject)
    .map((k) => esc(k) + "=" + esc(myObject[k]))
    .join("&");
  return query;
}

function createUserRecipe(button, dietaryRequirements, userText) {
  let recipe = {
    [button.name]: button.value,
    array: [...dietaryRequirements, ...[userText]],
    I_do_not_eat: userText.placeholder
  };

  recipe.array.forEach((dietaryRequirement) => {
    recipe[dietaryRequirement.name] = dietaryRequirement.checked;
    if (dietaryRequirement.value !== "on") {
      recipe[dietaryRequirement.name] = dietaryRequirement.value;
    }
  });

  return recipe;
}

function loopOverArrayOfElements(array, display) {
  array.forEach((element) => {
    if (element) { // Check if the element is not null
      element.style.display = display;
      element.style.transition = "all 2s";
    }
  });
}







function displayElements(array) {
  loopOverArrayOfElements(array, "block");
}

function displayElementsFlex(array) {
  loopOverArrayOfElements(array, "flex");
}

function displayElementsGrid(array) {
  loopOverArrayOfElements(array, "grid");
}

function removeElements(array) {
  loopOverArrayOfElements(array, "none");
}

function emptyTheElement(element) {
  if (element) { // Check if the element is not null
    element.innerHTML = "";
  }
}

function resetCheckedStateToFalse(array) {
  array.forEach((requirement) => {
    if (requirement && requirement.checked) { // Check if the requirement is not null and checked
      requirement.checked = false;
    }
  });
}

function createAudio(data) {
  const binaryData = atob(data);
  const audioData = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    audioData[i] = binaryData.charCodeAt(i);
  }
  const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
  return URL.createObjectURL(audioBlob);
}

    // Function to cache the image URL/AUDIO (without fetching the image)
    async function cacheData(data, chache_name, type_of_data) {
      const cache = await caches.open(chache_name);
      const response = new Response(
        JSON.stringify({ data, timeStamp: Date.now })
      );
      await cache.put(`last-generated-${type_of_data}`, response);
    }



export { defaultRecipe, CACHE_NAME_URL, audioElement, CACHE_NAME_AUDIO, alert_message, cacheData, createQuery, displayElements, displayElementsFlex, displayElementsGrid, removeElements, emptyTheElement, resetCheckedStateToFalse, playAudio, pauseAudio, stopAudio, createAudio, createUserRecipe }