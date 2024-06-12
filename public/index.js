import {defaultRecipe,createQuery,displayElements,displayElementsFlex,displayElementsGrid,removeElements,
emptyTheElement,resetCheckedStateToFalse,playAudio,pauseAudio,stopAudio} from "./js_utilities/functions_and_variables.js";

const mainElement = document.querySelector(".main-element");

const backgroundImg = document.querySelector("#background-img");
const gptResponseElement = document.querySelector(".gpt-response");
const headline = document.querySelector(".headline");
const lactoseIntolerant = document.querySelector("#lactose-intolerant");
const loadingContainer = document.querySelector("#loading-container");
const allergies = document.querySelector(".allergies");
const darkLightButton = document.querySelector(".dark-light-button");
const userWantAnotherRecipe = document.querySelector(".want-another-recipe");
const tryAgainBtn = document.querySelector(".try-again-btn");
const recipeButtons = document.querySelectorAll(".recipe-button");
const sendRecipeToUserInboxBtn = document.querySelector(
  ".send-recipe-to-user-inbox"
);
const loadingText = document.querySelector("#loading-text");
const recording = document.querySelector(".recording");
const userEmail = document.querySelector("#user-email");
const emailSection = document.querySelector(".email-section");
const sendToUserInboxBtn = document.querySelector(".send-to-user-inbox-btn");
const dietaryRequirements = Array.from(document.querySelectorAll(".dietary-requirements"));
const otherDietaryRequirements = document.querySelector("#other-dietary-requirements");
const userText = document.querySelector("#user-text");

sendToUserInboxBtn.addEventListener("click", () => {
  if (userEmail.value !== "") {
    alert("an email has been sent to your inbox");
  }
});

otherDietaryRequirements.addEventListener("click", () => {
  if (otherDietaryRequirements.checked) {
    displayElements([userText]);
  } else {
    removeElements([userText]);
  }
});

sendRecipeToUserInboxBtn.addEventListener("click", () => {
  displayElementsGrid([emailSection]);
  removeElements([sendRecipeToUserInboxBtn]);
});

userWantAnotherRecipe.addEventListener("click", () => {
  displayElements([headline, allergies, ...recipeButtons, mainElement]);
  removeElements([userText, emailSection]);
  emptyTheElement(gptResponseElement);
  resetCheckedStateToFalse(dietaryRequirements);
  userText.value = "";
});

tryAgainBtn.addEventListener("click", () => {
  console.log("try again");
  displayElements([headline, allergies, ...recipeButtons, mainElement]);
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
    gptResponseElement.innerHTML = "";

    const eventSource = new EventSource(`/stream?${createQuery(userRecipe)}`);

    eventSource.onmessage = function (event) {
      let data = JSON.parse(event.data);

      console.log(data);
      if (data.message) {
        if (data.message === "stop") {
          eventSource.close();
          return;
        }
        displayElements([gptResponseElement]);
        gptResponseElement.textContent += data.message;
        return;
      } else if (data.errorMessage === "invalid_api_key") {
        eventSource.close();
        console.log(data.errorMessage);
        displayElements([gptResponseElement, tryAgainBtn]);
        removeElements([loadingContainer]);
        gptResponseElement.innerHTML = defaultRecipe;
        return;
      }

      if (data.audio) {
        console.log(data.audio);
        loadingText.innerHTML = "Hang in there creating the image...";
        displayElementsFlex([recording]);
        displayElements([sendRecipeToUserInboxBtn, userWantAnotherRecipe]);

        const speechBtns = Array.from(document.querySelectorAll(".fa-solid"));
        const speedBtn = document.querySelector("#speed");

        const binaryData = atob(data.audio);

        const audioData = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          audioData[i] = binaryData.charCodeAt(i);
        }

        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioElement = new Audio();
        audioElement.src = URL.createObjectURL(audioBlob);

        audioElement.stop = function () {
          this.pause();
          this.currentTime = 0;
        };

        speedBtn.addEventListener("change", () => {
          audioElement.playbackRate = speedBtn.value || 1;
        });

        speechBtns.forEach((speechBtn) => {
          speechBtn.addEventListener("click", () => {
            const btnName = speechBtn.getAttribute("name");
            if (btnName === "microphone") {
              playAudio(audioElement);
            } else if (btnName === "pause") {
              pauseAudio(audioElement);
            } else if (btnName === "stop") {
              stopAudio(audioElement);
            }
          });
        });
      }

      if (data.image) {
        console.log(data.image);
        removeElements([loadingContainer]);
        backgroundImg.src = data.image.data[0].url;
      }
    };
  });
});
