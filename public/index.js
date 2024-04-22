const resultElement = document.querySelector(".gpt-response");
const headline = document.querySelector(".headline");
const lactoseIntolerant = document.querySelector("#lactose-intolerant");
const vegan = document.querySelector("#vegan");
const loadingContainer = document.querySelector("#loading-container");
const allergies = document.querySelector(".allergies");
const darkLightButton = document.querySelector(".dark-light-button");
const buttons = document.querySelectorAll("button");
const dietaryRequirements = Array.from(
  document.querySelectorAll(".dietary-requirements")
);
let isLactoseIntolerant;
let dishOriginCountry;

darkLightButton.addEventListener("change", () => {
  let color = darkLightButton.checked
    ? "rgb(67, 63, 63)"
    : "rgb(183, 235, 183)";
  [resultElement, lactoseIntolerant, allergies, headline, ...buttons].forEach(
    (element) => {
      element.style.setProperty("--green", color);
      element.style.transition = "background-color 0.5s ease";
    }
  );
});
buttons.forEach((button) => {
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
    loadingContainer.style.display = "block";
    resultElement.innerHTML = "";
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
        if (resultElement) {
          const textContent = data.text.choices[0].message.content;
          const imageUrl = data.image.data[0].url;
          resultElement.innerHTML = `
            <p>${textContent}</p>
            <img src="${imageUrl}" alt="Generated Image">
          `;
        } else {
          console.error('Error: Element with class "gpt-response" not found');
        }
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        loadingContainer.style.display = "none";
      });
  });
});
