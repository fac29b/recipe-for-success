const resultElement = document.querySelector(".gpt-response");
const buttons = document.querySelectorAll("button");
const lactoseIntolerant = document.querySelector(".lactose-intolerant");
let isLactoseIntolerant;
let dishOriginCountry;

lactoseIntolerant.addEventListener("click", () => {
  console.log(lactoseIntolerant.checked);
});

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log(lactoseIntolerant.checked);
    console.log("hello world");
    dishOriginCountry = button.innerHTML;
    fetch("public/server.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dishOriginCountry: dishOriginCountry,
        isLactoseIntolerant: lactoseIntolerant.checked,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from the back-end", data);
      })
      .catch((error) => {
        console.error("Error", error);
      });
    fetch(
      `/openai?recipe_country_of_origin=${encodeURIComponent(
        dishOriginCountry
      )}&is_lactose_intolerant=${encodeURIComponent(lactoseIntolerant.checked)} `
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
