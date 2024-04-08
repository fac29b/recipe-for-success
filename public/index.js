const resultElement = document.querySelector(".gpt-response");
const buttons = document.querySelectorAll("button");
const lactoseIntolerant = document.querySelector(".lactose-intolerant");
let isLactoseIntolerant;
let recipeName;

lactoseIntolerant.addEventListener("click", () => {
  console.log(lactoseIntolerant.checked);
});

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log(lactoseIntolerant.checked);
    console.log("hello world");
    recipeName = button.innerHTML;
    fetch("public/server.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variable: recipeName,
        variable2: lactoseIntolerant.checked,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from the back-end", data);
      })
      .catch((error) => {
        console.error("Error", error);
      });
    JSON.stringify({
      variable: recipeName,
      variable2: lactoseIntolerant.checked,
    });
    fetch(
      `/openai?recipe=${encodeURIComponent(
        recipeName
      )}&lactose=${encodeURIComponent(lactoseIntolerant.checked)} `
    )
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
