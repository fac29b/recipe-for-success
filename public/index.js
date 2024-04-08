const resultElement = document.querySelector(".gpt-response");
const buttons = document.querySelectorAll("button");
const darkLightButton = document.querySelector(".dark-light-button");
const allergies = document.querySelector(".allergies");
const title = document.querySelector("h1");

darkLightButton.addEventListener("change", () => {
  const color = darkLightButton.checked
    ? "rgb(67, 63, 63)"
    : "rgb(183, 235, 183)";
  [allergies, title, resultElement, ...buttons].forEach((element) => {
    element.style.setProperty("--green", color);
  });
});

let recipeName;
let lactoseIntolerant = false;
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log("hello world");
    recipeName = button.innerHTML;
    fetch("public/server.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ variable: recipeName }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from the back-end", data);
      })
      .catch((error) => {
        console.error("Error", error);
      });
    fetch(`/openai?recipe=${encodeURIComponent(recipeName)}`)
      .then((response) => response.json())
      .then((data) => {
        if (resultElement) {
          resultElement.innerHTML = `<p>${data.choices[0].message.content}</p>`;
        } else {
          console.error('Error: Element with class "gpt-response" not found');
        }
      })
      .catch((error) => console.error("Error:", error));
  });
});
