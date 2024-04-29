const mainElement = document.querySelector(".main-element");
const gptResponseElement = document.querySelector(".gpt-response");
const headline = document.querySelector(".headline");
const lactoseIntolerant = document.querySelector("#lactose-intolerant");
const vegan = document.querySelector("#vegan");
const loadingContainer = document.querySelector("#loading-container");
const allergies = document.querySelector(".allergies");
const darkLightButton = document.querySelector(".dark-light-button");
const userWantAnotherRecipe = document.querySelector(".want-another-recipe");
const recipeButtons = document.querySelectorAll(".recipe-button");
const sendRecipeToUserInbox = document.querySelector(".send-recipe-to-user-inbox");
const userEmail = document.querySelector("#user-email");
const sendEmailButton = document.querySelector(".send-email-btn");
const emailSection = document.querySelector(".email-section");
console.log(emailSection);
const dietaryRequirements = Array.from(
  document.querySelectorAll(".dietary-requirements")
);


console.log(dietaryRequirements)
const otherDietaryRequirements = document.querySelector("#other-dietary-requirements");
const userText = document.querySelector("#user-text")
let textContent;
let imageUrl;
let isLactoseIntolerant;
let dishOriginCountry;

console.log(userText.value)


function loopOverArrayOfElements(array, display) {
  array.forEach((elememt) => {
    elememt.style.display = display;
    elememt.style.transition = "all 2s"; // not sure that does something yet
  });
}

// otherDietaryRequirements.addEventListener("click", function() {
//   if(otherDietaryRequirements.checked) {
//     displayElements([userText]);
//   } else {
//     removeElements([userText])
//   }
// })



function displayElements(array) {
  loopOverArrayOfElements(array, "block");
}

function displayElementsGrid(array) {
  loopOverArrayOfElements(array, "grid")
}

function removeElements(array) {
  loopOverArrayOfElements(array, "none");
}

function emptyTheElement(elememt) {
  elememt.innerHTML = "";
}


sendRecipeToUserInbox.addEventListener("click", () => {
  displayElementsGrid([emailSection]);
  removeElements([sendRecipeToUserInbox]);
  emailSection.classList.add("grid");
})

userWantAnotherRecipe.addEventListener("click", () => {
  displayElements([headline, allergies, ...recipeButtons]);
  removeElements([gptResponseElement, userWantAnotherRecipe, userEmail, sendRecipeToUserInbox, userText]);
  emptyTheElement(gptResponseElement);
  userText.value = "";
  emailSection.classList.remove("grid");
  dietaryRequirements.forEach(requirement => {
    console.log(requirement.checked)
    if(requirement.checked) {
      requirement.checked = false
    }
  })
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
    ...recipeButtons,
  ].forEach((element) => {
    element.style.setProperty("--green", color);
    element.style.transition = "background-color 0.5s ease";
  });
});
recipeButtons.forEach((button) => {
  console.log(userText.value)
  button.addEventListener("click", () => {
    let userRecipe = {
      [button.name]: button.value,
      array: [...dietaryRequirements, ...[userText]],
      loopOverArray: function () {
        this.array.forEach((dietaryRequirement) => {
            this[dietaryRequirement.name] = dietaryRequirement.checked;
            if(dietaryRequirement.value !== "on") {
              this[dietaryRequirement.name] = dietaryRequirement.value;
            }
        });
    
      },
    };

    userRecipe.loopOverArray();
    console.log(userRecipe);

    dishOriginCountry = button.value; // needed ?∫
    displayElements([loadingContainer]);
    gptResponseElement.innerHTML = "";
    fetch("public/server.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userRecipe),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from the back-end", data);
      })
      .catch((error) => {
        console.error("Error", error);
      });

    let esc = encodeURIComponent; // declare variable  at the top ?
    let query = Object.keys(userRecipe)  // declare variable  at the top ?
      .map((k) => esc(k) + "=" + esc(userRecipe[k]))
      .join("&");
    fetch(`/openai?${query} `)
      .then((response) => response.json())
      .then((data) => {
        textContent = data.text.choices[0].message.content;
        imageUrl = data.image.data[0].url;
        mainElement.style.backgroundImage = `url(${imageUrl})`;
        gptResponseElement.innerHTML = `${textContent}`;
        removeElements([headline, allergies, ...recipeButtons]);
        displayElements([userWantAnotherRecipe, gptResponseElement, sendRecipeToUserInbox]);
      
        
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        loadingContainer.style.display = "none";
      });
  });
});
