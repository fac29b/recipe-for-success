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
  cacheData,
  CACHE_NAME_AUDIO,
  audioElement,
  alert_message
} from "./js_utilities/functions_and_variables.js";

import {
  mainElement,
  backgroundImg,
  gptResponseElement,
  headline,
  loadingContainer,
  allergies,
  darkLightButton,
  userWantAnotherRecipe,
  tryAgainBtn,
  recipeButtons,
  sendRecipeToUserInboxBtn,
  recording,
  userEmail,
  emailSection,
  sendToUserInboxBtn,
  dietaryRequirements,
  otherDietaryRequirements,
  userText,
  video,
  canvas,
  takePicture,
  context,
  chatGptVisionText,
  videoBtnCanvas,
  pictureSectionHeadline,
  wantToTakeAPicture,
  emailRecipe,
  pictureEmailSection,
  previousPage,
  sendToUserInbox,
  wrapper
} from "./js_utilities/query_selector.js";

let currentCameraIndex = 0;
const switchCameraButton = document.getElementById("switchCamera");
let emailObject;

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
      alert(`${alert_message}`);
      return response.json();
    } else {
      throw new Error("Failed to post image");
    }
  });
});

sendToUserInboxBtn.addEventListener("click", () => {
  console.log(emailObject);
  fetch(`/email?${createQuery(emailObject)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.emailStatus === "250 OK , completed") {
        alert(`${alert_message}`);
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

    const data = {};

    const eventSource = new EventSource(`/stream?${createQuery(userRecipe)}`);

    eventSource.onmessage = async function (event) {
      let eventData = JSON.parse(event.data);
      if (eventData.message) {
        if (eventData.message === "stop") {
          eventSource.close();
          return;
        }
        displayElements([gptResponseElement]);
        gptResponseElement.textContent += eventData.message;
        return;
      } else if (eventData.errorMessage === "invalid_api_key") {
        eventSource.close();
        console.log(eventData.errorMessage);
        displayElements([gptResponseElement, tryAgainBtn]);
        removeElements([loadingContainer]);
        gptResponseElement.innerHTML = defaultRecipe;
        return;
      }

      if (eventData.audio) {
        data.audio = eventData.audio;
      }
      if (eventData.image) {
        data.image = eventData.image;
      }
     
      console.log("data.audio", eventData.audio);
      console.log("data.image", eventData.image);

      if (data.audio && data.image) {
        removeElements([loadingContainer]);
        const imageUrl = data.image.data[0].url;
        // await cacheData(imageUrl, CACHE_NAME_URL, "image");
        backgroundImg.src = imageUrl;
       
  
        ///
      
        const audio_data = createAudio(data.audio);
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
    };
  });
});

// Picture section
async function getVideoDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === "videoinput");
}

async function startCamera(deviceId) {
  const constraints = {
    audio: false,
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { min: 1024, ideal: 1280, max: 1920 },
      height: { min: 576, ideal: 720, max: 1080 },
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

async function initializeCamera() {
  const videoDevices = await getVideoDevices();

  if (videoDevices.length > 1) {
    switchCameraButton.style.display = "block";
    switchCameraButton.addEventListener("click", () => {
      currentCameraIndex = (currentCameraIndex + 1) % videoDevices.length;
      startCamera(videoDevices[currentCameraIndex].deviceId);
    });
  } else {
    switchCameraButton.style.display = "none";
  }

  // Start with the rear camera if available
  const rearCameraDevice = videoDevices.find(
    (device) =>
      device.label.toLowerCase().includes("back") ||
      device.label.toLowerCase().includes("rear")
  );
  startCamera(
    rearCameraDevice ? rearCameraDevice.deviceId : videoDevices[0].deviceId
  );
}

initializeCamera();


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


menuIcon.addEventListener("click", () => {
wrapper.classList.toggle("change");
});
