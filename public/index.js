import {defaultRecipe,createQuery,displayElements,displayElementsFlex,displayElementsGrid,removeElements,emptyTheElement,resetCheckedStateToFalse,playAudio,pauseAudio,stopAudio} from "./js_utilities/functions_and_variables.js";
import {mainElement,backgroundImg,gptResponseElement,headline,lactoseIntolerant,loadingContainer,allergies,darkLightButton,userWantAnotherRecipe,tryAgainBtn,recipeButtons,sendRecipeToUserInboxBtn,loadingText,recording,userEmail,emailSection,sendToUserInboxBtn,dietaryRequirements,otherDietaryRequirements,userText,pictureSection, video, canvas,takePicture, context} from "./js_utilities/query_selector.js";


console.log(canvas)

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

        userWantAnotherRecipe.addEventListener("click", () => {
          displayElements([headline, allergies, ...recipeButtons, mainElement]);
          removeElements([userText, emailSection]);
          emptyTheElement(gptResponseElement);
          resetCheckedStateToFalse(dietaryRequirements);
          userText.value = "";
          data.audio = "";
          stopAudio(audioElement)
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



// picture section


// Request access to the user's camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        // Set the video source and start playing
        video.srcObject = stream;
        video.play();
    })
    .catch((error) => {
        console.error('Error accessing camera:', error);
    });

// Function to capture a photo
function capturePhoto() {
    // Set the canvas dimensions to match the video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas as a base64-encoded string
    const imageData = canvas.toDataURL('image/png');

    // Do something with the captured photo (e.g., send it to a server)
    console.log('Captured photo:', imageData);
}

// Example usage: capture a photo when a button is clicked

takePicture.addEventListener('click', () => {
    // Capture the photo
    capturePhoto();

    // Get the image data from the canvas as a base64-encoded string
    const imageData = canvas.toDataURL('image/png');

    // Send the image data to the backend
    fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => {
        if (response.ok) {
            console.log('Image uploaded successfully');
        } else {
            console.error('Failed to upload image');
        }
    })
    .catch(error => {
        console.error('Error uploading image:', error);
    });
});
