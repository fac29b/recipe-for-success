const mainElement = document.querySelector(".main-element");
const test = document.querySelector(".test");
const backgroundImg = document.querySelector("#background-img");
const gptResponseElement = document.querySelector(".gpt-response");
const headline = document.querySelector(".headline");
const lactoseIntolerant = document.querySelector("#lactose-intolerant");
const vegan = document.querySelector("#vegan");
const loadingContainer = document.querySelector("#loading-container");
const allergies = document.querySelector(".allergies");
const darkLightButton = document.querySelector(".dark-light-button");
const userWantAnotherRecipe = document.querySelector(".want-another-recipe");
const tryAgainBtn = document.querySelector(".try-again-btn");
const recipeButtons = document.querySelectorAll(".recipe-button");
const sendRecipeToUserInboxBtn = document.querySelector(
  ".send-recipe-to-user-inbox"
);
const recording = document.querySelector(".recording");
console.log(recording);
const stream = document.querySelector(".stream");
console.log(stream);
const userEmail = document.querySelector("#user-email");
const sendEmailButton = document.querySelector(".send-email-btn");
const emailSection = document.querySelector(".email-section");
const paperPlane = document.querySelector(".fa-paper-plane");
const sendToUserInboxBtn = document.querySelector(".send-to-user-inbox-btn");

const dietaryRequirements = Array.from(
  document.querySelectorAll(".dietary-requirements")
);
const otherDietaryRequirements = document.querySelector(
  "#other-dietary-requirements"
);
const userText = document.querySelector("#user-text");
let textContent;
let imageUrl;
let isLactoseIntolerant;
let dishOriginCountry;
let currentChar;
let mp3;

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
let errorMessage = `

      ${defaultRecipe}
  `;

tryAgainBtn.style.display = "none";

sendToUserInboxBtn.addEventListener("click", () => {
  if (userEmail.value !== "") {
    alert("an email has been sent to your inbox");
  }
});

function createQuery(myObject) {
  let esc = encodeURIComponent;
  let query = Object.keys(myObject)
    .map((k) => esc(k) + "=" + esc(myObject[k]))
    .join("&");
  return query;
}

function loopOverArrayOfElements(array, display) {
  array.forEach((elememt) => {
    elememt.style.display = display;
    elememt.style.transition = "all 2s";
  });
}

otherDietaryRequirements.addEventListener("click", () => {
  if (otherDietaryRequirements.checked) {
    displayElements([userText]);
  } else {
    removeElements([userText]);
  }
});

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

function emptyTheElement(elememt) {
  elememt.innerHTML = "";
}

sendRecipeToUserInboxBtn.addEventListener("click", () => {
  displayElementsGrid([emailSection]);
  removeElements([sendRecipeToUserInboxBtn]);
});

function resetCheckedStateToFalse(array) {
  array.forEach((requirement) => {
    if (requirement.checked) {
      requirement.checked = false;
    }
  });
}

userWantAnotherRecipe.addEventListener("click", () => {
  displayElements([headline, allergies, ...recipeButtons, mainElement]);
  removeElements([userText, emailSection]);
  emptyTheElement(gptResponseElement);
  resetCheckedStateToFalse(dietaryRequirements);
  userText.value = "";
});

tryAgainBtn.addEventListener("click", () => {
  displayElements([headline, allergies, ...recipeButtons]);
  removeElements([gptResponseElement, tryAgainBtn]);
  emptyTheElement(gptResponseElement);
});

darkLightButton.addEventListener("change", () => {
  let color = darkLightButton.checked
    ? "rgb(67, 63, 63)"
    : "rgb(183, 235, 183)";
  [
    gptResponseElement,
    lactoseIntolerant,
    allergies,
    headline,
    userWantAnotherRecipe,
    sendRecipeToUserInboxBtn,
    tryAgainBtn,
    ...recipeButtons,
  ].forEach((element) => {
    element.style.setProperty("--green", color);
    element.style.transition = "background-color 0.5s ease";
  });
});

sendToUserInboxBtn.addEventListener("click", () => {
  let emailOBject = {
    [userEmail.name]: userEmail.value,
  };
  fetch("/server.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailOBject),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response for user email", data);
    })
    .catch((error) => {
      console.error("Error", error);
    });

  fetch(`/email?${createQuery(emailOBject)}`)
    .then((response) => response.json())
    .then((data) => {
      console.log({ data }, { emailQuery });
    })
    .catch((error) => console.error("Error:", error));
});

recipeButtons.forEach((button) => {
  console.log(userText.value);
  button.addEventListener("click", async () => {
    recipeTextLoaded = false;
    recipeImageLoaded = false;

    removeElements([mainElement]);

    let userRecipe = {
      [button.name]: button.value,
      array: [...dietaryRequirements, ...[userText]],
      I_do_not_eat: userText.placeholder,
      loopOverArray: function () {
        this.array.forEach((dietaryRequirement) => {
          this[dietaryRequirement.name] = dietaryRequirement.checked;
          if (dietaryRequirement.value !== "on") {
            this[dietaryRequirement.name] = dietaryRequirement.value;
          }
        });
      },
    };

    userRecipe.loopOverArray();
    console.log(userRecipe);

    dishOriginCountry = button.value; // needed ?
    // displayElementsFlex([loadingContainer]);
    gptResponseElement.innerHTML = "";

    const eventSource = new EventSource(`/stream?${createQuery(userRecipe)}`);

    eventSource.onmessage = function (event) {
      let data = JSON.parse(event.data);
      if (data.message) {
        if (data.message === "stop") {
          eventSource.close();
          return;
        }
        displayElements([gptResponseElement])
        gptResponseElement.textContent += data.message;
        return;
      }

      if (data.image) {
        // TODO: handle image (copy the /openai fetch handler)
        console.log(data.image);
        backgroundImg.src = data.image.data[0].url;
      }

      if (data.audio) {
        // TODO: handle audio (copy the /openai fetch handler)
        console.log(data.audio)
          displayElementsFlex([recording]);
          displayElements([sendRecipeToUserInboxBtn, userWantAnotherRecipe]);
      }
    };

    // fetch("/server.js", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(userRecipe),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Response from the back-end", data);
    //   })
    //   .catch((error) => {
    //     console.error("Error", error);
    //   });
    //   fetch(`/openai?${createQuery(userRecipe)}`)
    //     .then((response) => response.json())
    //     .then((data) => {
    //       // CREATE IMAGE PROMISE
    //       const imagePromise = new Promise((resolve) => {
    //         console.log("image begin");

    //         // Wait for background image to be loaded
    //         backgroundImg.addEventListener("load", () => {
    //           resolve();
    //           mainElement.style.display = "none";

    //           console.log("image end");
    //         });

    //         // Set background image
    //         imageUrl = data.image.data[0].url;
    //         mp3 = data.audio;
    //         backgroundImg.src = imageUrl;

    //         console.log({ mp3 });
    //       });

    //       // Update text contennt once image is loaded
    //       Promise.all([imagePromise])
    //         .then(() => {
    //           console.log("image loaded:", Promise.all.status);
    //           textContent = data.text.choices[0].message.content;
    //           gptResponseElement.innerHTML = `
    //           <div class="recording">
    //             <i class="fa-solid fa-microphone" name="microphone"></i>
    //             <i class="fa-solid fa-pause" name="pause"></i>
    //             <i class="fa-solid fa-stop" name="stop"></i>
    //             <div class="speed-wrapper">
    //             <label for="speed">Speed</label>
    //             <input type="number" name="speed" id="speed" min="0.25" max="2" step="0.25" value="1">
    //             </div>
    //           </div>
    //           ${textContent}`;
    //           removeElements([headline, allergies, ...recipeButtons]);
    //           displayElements([
    //             userWantAnotherRecipe,
    //             gptResponseElement,
    //             sendRecipeToUserInboxBtn,
    //           ]);

    //           const speechBtns = Array.from(
    //             document.querySelectorAll(".fa-solid")
    //           );
    //           const speedBtn = document.querySelector("#speed");

    //           const binaryData = atob(data.audio);

    //           const audioData = new Uint8Array(binaryData.length);
    //           for (let i = 0; i < binaryData.length; i++) {
    //             audioData[i] = binaryData.charCodeAt(i);
    //           }

    //           const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
    //           const audioElement = new Audio();
    //           audioElement.src = URL.createObjectURL(audioBlob);

    //           function playAudio() {
    //             audioElement.play();
    //           }

    //           function pauseAudio() {
    //             audioElement.pause();
    //           }

    //           audioElement.stop = function () {
    //             this.pause();
    //             this.currentTime = 0;
    //           };

    //           function stopAudio() {
    //             audioElement.stop();
    //           }

    //           speedBtn.addEventListener("change", () => {
    //             audioElement.playbackRate = speedBtn.value || 1;
    //           });

    //           speechBtns.forEach((speechBtn) => {
    //             speechBtn.addEventListener("click", () => {
    //               const btnName = speechBtn.getAttribute("name");
    //               if (btnName === "microphone") {
    //                 playAudio();
    //               } else if (btnName === "pause") {
    //                 pauseAudio();
    //               } else if (btnName === "stop") {
    //                 stopAudio();
    //               }
    //             });
    //           });
    //         })
    //         .catch((error) => {
    //           console.error("Error:", error);
    //           gptResponseElement.innerHTML = `${errorMessage}`;
    //           removeElements([headline, allergies, ...recipeButtons]);
    //           displayElements([tryAgainBtn, gptResponseElement]);
    //         })
    //         .finally(() => {
    //           //HIDES LOADING WHETHER OR NOT IT FAILS
    //           loadingContainer.style.display = "none";
    //           console.log("All promises have been settled");
    //         });
    //     })
    //     .catch((error) => {
    //       console.error("Error:", error);
    //       gptResponseElement.innerHTML = `${errorMessage}`;
    //       removeElements([headline, allergies, ...recipeButtons]);
    //       displayElements([tryAgainBtn, gptResponseElement]);
    //     });
  });
});


