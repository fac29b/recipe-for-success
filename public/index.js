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
console.log(recipeButtons);
const dietaryRequirements = Array.from(
  document.querySelectorAll(".dietary-requirements")
);
let textContent;
let imageUrl;
let isLactoseIntolerant;
let dishOriginCountry;


console.log(gptResponseElement)

function loopOverArrayOfElements(array, display) {
  array.forEach(elememt => {
    elememt.style.display = display
  })

}



function displayElements(array) {
 loopOverArrayOfElements(array, "block")
}

function removeElement(array) {
 loopOverArrayOfElements(array, "none")
}

function makeElementEmpty(elememt) {
  elememt.innerHTML = ""
}


userWantAnotherRecipe.addEventListener("click", () => {
  displayElements([headline, allergies, ...recipeButtons]);
  removeElement([gptResponseElement, userWantAnotherRecipe]);
  makeElementEmpty(gptResponseElement);
})



darkLightButton.addEventListener("change", () => {
  let color = darkLightButton.checked
    ? "rgb(67, 63, 63)"
    : "rgb(183, 235, 183)";
  [gptResponseElement, lactoseIntolerant, allergies, headline, userWantAnotherRecipe, ...recipeButtons].forEach(
    (element) => {
      element.style.setProperty("--green", color);
      element.style.transition = "background-color 0.5s ease";
    }
  );
});
recipeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    let userRecipe = {
      [button.name]: button.value,
      array: dietaryRequirements,
      loopOverArray: function () {
        this.array.forEach((dietaryRequirement) => {
          return (this[dietaryRequirement.name] = dietaryRequirement.checked);
        });
      },
    };

    userRecipe.loopOverArray();
    console.log(userRecipe);
   

    dishOriginCountry = button.value;
    displayElements([loadingContainer])
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

    let esc = encodeURIComponent;
    let query = Object.keys(userRecipe)
      .map((k) => esc(k) + "=" + esc(userRecipe[k]))
      .join("&");
    fetch(`/openai?${query} `)
      .then((response) => response.json())
      .then((data) => {
        // if (gptResponseElement) {
          textContent = data.text.choices[0].message.content;
          imageUrl = data.image.data[0].url;
          mainElement.style.backgroundImage = `url(${imageUrl})`
          gptResponseElement.innerHTML = `${textContent}`;
          removeElement([headline, allergies, ...recipeButtons]);
          displayElements([userWantAnotherRecipe]);
          displayElements([gptResponseElement])
        // } else {
        //   console.error('Error: Element with class "gpt-response" not found');
        // }
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        loadingContainer.style.display = "none";
      });
  });
});

