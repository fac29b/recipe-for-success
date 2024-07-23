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

let audioElement;
let emailObject



wantToTakeAPicture.addEventListener("click", () => {
  removeElements([pictureSectionHeadline, wantToTakeAPicture]);
  displayElementsFlex([videoBtnCanvas]);
  console.log("Picture taken");
});

takePicture.addEventListener("click", () => {
  console.log("take a picture")
})

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
  removeElements([videoBtnCanvas, pictureEmailSection, previousPage, emailRecipe]);
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
  document.body.classList.toggle('dark-mode', darkLightButton.checked);
});

const x = [...userEmail]
x.forEach(element => {
  element.addEventListener("input", (e) => {
    emailObject = {
      [element.name] : element.value,
    }
    console.log(e.target.value)
  }) 
})

console.log(emailObject)

// const elements = [sendToUserInboxBtn, sendToUserInbox];


sendToUserInbox.addEventListener("click", () => {
  fetch(`/email_picture_section?${createQuery(emailObject)}`, {
    method: "POST",
    headers: {
      "Content-Type" : "application/json"
    },
    body: JSON.stringify({pictureTextSection: chatGptVisionText.textContent})
  })
  .then((response) => {
    if (response.ok) {
      console.log("image posted");
      return response.json()
    } else {
      throw new Error("Failed to post image")
    }
  })

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
  // emailObject[userEmail.name] = "";
  console.log(emailObject);
  // console.log(`emailUserRecipeSection ${emailUserRecipeSection.value}`);


recipeButtons.forEach((button) => {
  console.log(userText.value);
  button.addEventListener("click", async () => {
    displayElements([loadingContainer]);
    removeElements([mainElement]);
    const userRecipe = createUserRecipe(button, dietaryRequirements, userText);
    console.log(userRecipe);

    const CACHE_NAME = 'image-cache-v1';

    // Function to cache the image URL (without fetching the image)
    async function cacheImageUrl(url) {
      const cache = await caches.open(CACHE_NAME);
      const response = new Response(JSON.stringify({ url, timestamp: Date.now() }));
      await cache.put('last-generated-image', response);
    }
    
    // Function to get the cached image URL
    async function getCachedImageUrl() {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match('last-generated-image');
      if (response) {
        const data = await response.json();
        const now = Date.now();
        if (now - data.timestamp < 24 * 60 * 60 * 1000) {  // 24 hours
          return data.url;
        } else {
          // Remove expired cache entry
          await cache.delete('last-generated-image');
        }
      }
      return null;
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
        loadingText.innerHTML = "Hang in there creating the audio and image...";
        displayElementsFlex([recording]);
        displayElements([sendRecipeToUserInboxBtn, userWantAnotherRecipe]);

        const speechBtns = Array.from(document.querySelectorAll(".fa-solid"));
        const speedBtn = document.querySelector("#speed");

        audioElement = createAudio(data.audio);

        audioElement.stop = function () {
          this.pause();
          this.currentTime = 0;
        };

        userWantAnotherRecipe.addEventListener("click", () => {
          displayElements([headline, allergies, ...recipeButtons, mainElement]);
          removeElements([userText, emailSection]);
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
        console.log(data.image);
        removeElements([loadingContainer]);
        const imageUrl = data.image.data[0].url;
         // Cache the image URL
         await cacheImageUrl(imageUrl);
        backgroundImg.src = imageUrl;
      }




    };

// Before setting up the eventSource, check for a cached image URL
async function loadCachedImage() {
  const cachedImageUrl = await getCachedImageUrl();
  if (cachedImageUrl) {
    backgroundImg.src = cachedImageUrl;
  }
}

// Call this function before setting up the eventSource
loadCachedImage();
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
