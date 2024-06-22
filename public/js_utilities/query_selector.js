const emailRecipe = document.querySelector(".email-recipe");
const pictureEmailSection = document.querySelector(".picture-email-section");
const mainElement = document.querySelector(".main-element");
const pictureSectionHeadline = document.querySelector(".picture-section-headline");
const  pictureSection = document.querySelector(".picture-section")
const takePicture = document.querySelector(".take-picture");
const wantToTakeAPicture = document.querySelector(".want-to-take-a-picture");
const videoBtnCanvas = document.querySelector(".video-btn-canvas");
const chatGptVisionText = document.querySelector(".chat-gpt-vision-text");
const video = document.querySelector(".video");
const canvas = document.querySelector(".canvas");
const context = canvas.getContext('2d');
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
const userEmail = document.querySelector(".user-email");
const emailSection = document.querySelector(".email-section");
const sendToUserInboxBtn = document.querySelector(".send-to-user-inbox-btn");
const dietaryRequirements = Array.from(
  document.querySelectorAll(".dietary-requirements")
);
const otherDietaryRequirements = document.querySelector(
  "#other-dietary-requirements"
);
const userText = document.querySelector("#user-text");
const constraint = {
  audio: false,
  video: {
  width: {min: 1024, ideal: 1280, max: 1920},
  height: {min: 576, ideal: 720, max: 1080}
}
}


export {
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
  pictureEmailSection 
};



