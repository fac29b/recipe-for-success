import {
  defaultRecipe, createQuery, displayElements, displayElementsFlex, displayElementsGrid, removeElements, emptyTheElement, resetCheckedStateToFalse, playAudio, pauseAudio, stopAudio, createAudio, createUserRecipe
} from "./js_utilities/functions_and_variables.js";
import {
  mainElement, backgroundImg, gptResponseElement, headline, lactoseIntolerant, loadingContainer, allergies, darkLightButton, userWantAnotherRecipe, tryAgainBtn, recipeButtons, sendRecipeToUserInboxBtn, loadingText, recording, userEmail, emailSection, sendToUserInboxBtn, dietaryRequirements, otherDietaryRequirements, userText, pictureSection, video, canvas, takePicture, context, constraint, chatGptVisionText, videoBtnCanvas, pictureSectionHeadline, wantToTakeAPicture, emailRecipe, pictureEmailSection, previousPage, sendToUserInbox, emailUserRecipeSection,
} from "./js_utilities/query_selector.js";

let audioElement
wantToTakeAPicture.addEventListener("click", () => {
  // displayElements([videoBtnCanvas])
  removeElements([pictureSectionHeadline, wantToTakeAPicture]);
  displayElementsFlex([videoBtnCanvas]);
  console.log("picture taken")
})

// sendToUserInboxBtn.addEventListener("click", () => {
//   if (userEmail.value !== "") {
//     alert("an email has been sent to your inbox");
//   }
// });

otherDietaryRequirements.addEventListener("click", () => {
  if (otherDietaryRequirements.checked) {
    displayElements([userText]);
  } else {
    removeElements([userText]);
  }
});




emailRecipe.addEventListener("click", () => {
  displayElementsGrid([pictureEmailSection]);
  removeElements([emailRecipe]);
})


sendRecipeToUserInboxBtn.addEventListener("click", () => {
  console.log("email to user")
  displayElementsGrid([emailSection]);
  removeElements([sendRecipeToUserInboxBtn]);
})




previousPage.addEventListener("click", () => {
  removeElements([videoBtnCanvas, pictureEmailSection, previousPage, emailRecipe]);
  displayElements([pictureSectionHeadline, wantToTakeAPicture]);
  emptyTheElement(chatGptVisionText);
})



tryAgainBtn.addEventListener("click", () => {
  console.log("try again");
  displayElements([headline, allergies, ...recipeButtons, mainElement]);
  removeElements([gptResponseElement, tryAgainBtn]);
  emptyTheElement(gptResponseElement);
});

darkLightButton.addEventListener("change", () => {
  document.body.classList.toggle('dark-mode', darkLightButton.checked);
});



[sendToUserInboxBtn, sendToUserInbox].forEach((element) => {
  element.addEventListener("click", () => {

    let emailOBject = {
      [userEmail.name]: userEmail.value || emailUserRecipeSection.value
    };
    fetch(`/email?${createQuery(emailOBject)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.emailStatus === "250 OK , completed") {
          alert("an email has been sent to your inbox");
        } else {
          alert("invalid email address try again");
        }
      })
      .catch((error) => console.error("Error:", error));
  });
  console.log(userEmail.value)
})

let currentEventSource = null;

recipeButtons.forEach((button) => {
  console.log(userText.value);
  button.addEventListener("click", async () => {
    // Close any existing EventSource connection
    if (currentEventSource) {
      currentEventSource.close();
    }
    // Display the loading indicator
    displayElements([loadingContainer]);

    // Hide the main element
    removeElements([mainElement]);

    const userRecipe = createUserRecipe(button, dietaryRequirements, userText);
    console.log(userRecipe);
    currentEventSource = new EventSource(`/stream?${createQuery(userRecipe)}`);

    currentEventSource.onmessage = function (event) {
      let data = JSON.parse(event.data);
      if (data.message) {
        if (data.message === "stop") {
          currentEventSource.close();
          return;
        }
        displayElements([gptResponseElement]);
        gptResponseElement.textContent += data.message;
        return;
      } else if (data.errorMessage === "invalid_api_key") {
        currentEventSource.close();
        console.log(data.errorMessage);
        displayElements([gptResponseElement, tryAgainBtn]);
        removeElements([loadingContainer]);
        gptResponseElement.innerHTML = defaultRecipe;
        return;
      }

      if (data.audio) {
        console.log(data.audio);
        loadingText.innerHTML = "Hang in there creating the audio and image...";


        // Reset the audio element before setting a new one
        if (audioElement) {
          stopAudio(audioElement);
        }

        audioElement = createAudio(data.audio);

        audioElement.stop = function () {
          this.pause();
          this.currentTime = 0;
        };
        displayElementsFlex([recording]);
        displayElements([sendRecipeToUserInboxBtn, userWantAnotherRecipe]);
        removeElements([loadingContainer]);
        const speechBtns = Array.from(document.querySelectorAll(".fa-solid"));
        const speedBtn = document.querySelector("#speed");

        userWantAnotherRecipe.addEventListener("click", () => {
          displayElements([headline, allergies, ...recipeButtons, mainElement]);
          removeElements([userText, emailSection]);
          emptyTheElement(gptResponseElement);
          resetCheckedStateToFalse(dietaryRequirements);
          userText.value = "";
          data.audio = "";
          stopAudio(audioElement);
          currentEventSource.close();
        });

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


const menuIcon = document.querySelector(".menu-icon");
const container = document.querySelector(".container");

menuIcon.addEventListener("click", () => {
  container.classList.toggle("change");
});