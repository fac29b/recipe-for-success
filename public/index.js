const resultElement = document.querySelector(".gpt-response");
const headline = document.querySelector(".headline");
const lactoseIntolerant = document.querySelector(".lactose-intolerant");
const darkLightButton = document.querySelector(".dark-light-button");
const buttons = document.querySelectorAll("button");
let isLactoseIntolerant;
let dishOriginCountry;
let random; 


lactoseIntolerant.addEventListener("click", () => {
  console.log(lactoseIntolerant.checked);
});


darkLightButton.addEventListener("change", ()=> {
  let color = darkLightButton.checked ? "rgb(67, 63, 63)" : "gb(183, 235, 183)";
  [resultElement, lactoseIntolerant, ...buttons].forEach(element => {
    element.style.setProperty('--green', color);
  })
})



buttons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log(lactoseIntolerant.checked);
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

      let obj = {
        recipe_country_of_origin: dishOriginCountry,
        is_lactose_intolerant: lactoseIntolerant.checked,
      }
     
      let url = new URLSearchParams(obj)
      let stringQuery = url.toString();
      console.log({url}, {stringQuery})

      var esc = encodeURIComponent;
      var query = Object.keys(obj)
          .map(k => esc(k) + '=' + esc(obj[k]))
          .join('&');

    fetch(
      `/openai?${query} `
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
