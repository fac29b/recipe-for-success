import {
  defaultRecipe,
  createQuery,
  displayElements,
  displayElementsFlex,
  displayElementsGrid,
  removeElements,
  emptyTheElement,
  resetCheckedStateToFalse,
  playAudio,
  pauseAudio,
  stopAudio,
  createAudio,
  createUserRecipe,
} from "./js_utilities/functions_and_variables.js";

import {
  mainElement,
  backgroundImg,
  gptResponseElement,
  headline,
  lactoseIntolerant,
  loadingContainer,
  allergies,
  darkLightButton,
  userWantAnotherRecipe,
  tryAgainBtn,
  recipeButtons,
  sendRecipeToUserInboxBtn,
  loadingText,
  recording,
  userEmail,
  emailSection,
  sendToUserInboxBtn,
  dietaryRequirements,
  otherDietaryRequirements,
  userText,
  pictureSection,
  video,
  canvas,
  takePicture,
  context,
  constraint,
  chatGptVisionText,
  videoBtnCanvas,
  pictureSectionHeadline,
  wantToTakeAPicture,
  emailRecipe,
  pictureEmailSection,
  previousPage,
  sendToUserInbox,
  emailUserRecipeSection,
} from "./js_utilities/query_selector.js";

let audioElement = new Audio();

let emailObject;

const audio_source = document.querySelector(".audio_source");

console.log(audio_source);

wantToTakeAPicture.addEventListener("click", () => {
  removeElements([pictureSectionHeadline, wantToTakeAPicture]);
  displayElementsFlex([videoBtnCanvas]);
  console.log("Picture taken");
});

takePicture.addEventListener("click", () => {
  console.log("take a picture");
});

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
});

sendRecipeToUserInboxBtn.addEventListener("click", () => {
  console.log("Email to user");
  displayElementsGrid([emailSection]);
  removeElements([sendRecipeToUserInboxBtn]);
});

previousPage.addEventListener("click", () => {
  removeElements([
    videoBtnCanvas,
    pictureEmailSection,
    previousPage,
    emailRecipe,
  ]);
  displayElements([pictureSectionHeadline, wantToTakeAPicture]);
  emptyTheElement(chatGptVisionText);
});

tryAgainBtn.addEventListener("click", () => {
  console.log("Try again");
  displayElements([headline, allergies, ...recipeButtons, mainElement]);
  removeElements([gptResponseElement, tryAgainBtn]);
  emptyTheElement(gptResponseElement);
});

darkLightButton.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", darkLightButton.checked);
});

const user_email_elememts = [...userEmail];
user_email_elememts.forEach((element) => {
  element.addEventListener("input", (e) => {
    emailObject = {
      [element.name]: element.value,
    };
    console.log(e.target.value);
  });
});

console.log(emailObject);

sendToUserInbox.addEventListener("click", () => {
  fetch(`/email_picture_section?${createQuery(emailObject)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pictureTextSection: chatGptVisionText.textContent }),
  }).then((response) => {
    if (response.ok) {
      console.log("image posted");
      return response.json();
    } else {
      throw new Error("Failed to post image");
    }
  });
});

sendToUserInboxBtn.addEventListener("click", () => {
  console.log(`userEmail ${userEmail.value}`);
  console.log(emailObject);
  fetch(`/email?${createQuery(emailObject)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.emailStatus === "250 OK , completed") {
        alert("An email has been sent to your inbox");
      } else {
        alert("Invalid email address, try again");
      }
    })
    .catch((error) => console.error("Error:", error));
});

console.log(emailObject);

recipeButtons.forEach((button) => {
  console.log(userText.value);
  button.addEventListener("click", async () => {
    displayElements([loadingContainer]);
    removeElements([mainElement]);
    const userRecipe = createUserRecipe(button, dietaryRequirements, userText);
    console.log(userRecipe);

    const CACHE_NAME_URL = "image-cache-v1";
    const CACHE_NAME_AUDIO = "image-cache-v2";

    // Function to cache the image URL/AUDIO (without fetching the image)
    async function cacheData(data, chache_name, type_of_data) {
      const cache = await caches.open(chache_name);
      const response = new Response(
        JSON.stringify({ data, timeStamp: Date.now })
      );
      await cache.put(`last-generated-${type_of_data}`, response);
    }

    const eventSource = new EventSource(`/stream?${createQuery(userRecipe)}`);

    eventSource.onmessage = async function (event) {
      let data = JSON.parse(event.data);
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
        const audio_data = createAudio(data.audio);
        console.log(`line 261: ${audio_data}`);
        await cacheData(audio_data, CACHE_NAME_AUDIO, "audio");
        displayElementsFlex([recording]);
        displayElements([sendRecipeToUserInboxBtn, userWantAnotherRecipe]);
        const speechBtns = Array.from(document.querySelectorAll(".fa-solid"));
        const speedBtn = document.querySelector("#speed");
        audioElement.src = createAudio(data.audio);
        audioElement.stop = function () {
          this.pause();
          this.currentTime = 0;
        };

        userWantAnotherRecipe.addEventListener("click", () => {
          displayElements([headline, allergies, ...recipeButtons, mainElement]);
          removeElements([userText, emailSection, recording]);
          emptyTheElement(gptResponseElement);
          resetCheckedStateToFalse(dietaryRequirements);
          userText.value = "";
          data.audio = "";
          stopAudio(audioElement);
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
        console.log(typeof data.image);
        removeElements([loadingContainer]);
        const imageUrl = data.image.data[0].url;
        console.log(`imageURL ${imageUrl}`);
        await cacheData(imageUrl, CACHE_NAME_URL, "image");
        backgroundImg.src = imageUrl;
        backgroundImg.onload = () => {
          console.log("Image loaded successfully");
        };
        backgroundImg.onerror = () => {
          console.error("Error loading image");
        };
      }
    };
  });
});

// Picture section
navigator.mediaDevices
  .getUserMedia(constraint)
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((error) => {
    console.error("Error accessing camera:", error);
  });

function capturePhoto() {
  context.drawImage(video, 0, 0, 400, 100);
}

takePicture.addEventListener("click", () => {
  capturePhoto();
  const imageData = canvas.toDataURL("image/png");
  console.log("Captured photo:", imageData);

  fetch("/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageData }),
  })
    .then((response) => {
      if (response.ok) {
        console.log("Image uploaded successfully");
        return response.json();
      } else {
        throw new Error("Failed to upload image");
      }
    })
    .then((data) => {
      const chatGptVisionResponse = data.message.content;
      chatGptVisionText.textContent = chatGptVisionResponse;
      displayElements([emailRecipe, previousPage]);
      displayElementsGrid([pictureEmailSection]);
    })
    .catch((error) => {
      console.error("Error", error);
    });
});

// Menu icon toggle
const menuIcon = document.querySelector(".menu-icon");
const container = document.querySelector(".container");

menuIcon.addEventListener("click", () => {
  container.classList.toggle("change");
});
