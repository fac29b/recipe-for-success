const resultElement = document.querySelector(".gpt-response");
const buttons = document.querySelectorAll("button");
const lactoseIntolerant = document.querySelector(".lactose-intolerant");
const vegan = document.querySelector(".vegan");
let isLactoseIntolerant;
let dishOriginCountry;
let isVegan = true;

lactoseIntolerant.addEventListener("click", () => {
  console.log(lactoseIntolerant.checked);
});
vegan.addEventListener("click", () => {
    console.log(vegan.checked);
  });

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log(lactoseIntolerant.checked);
    dishOriginCountry = button.value;
    fetch("public/server.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dishOriginCountry: dishOriginCountry,
        isLactoseIntolerant: lactoseIntolerant.checked,
        isVegan: vegan.checked,
   
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
        is_vegan: vegan.checked,
      }
     
      let url = new URLSearchParams(obj)
      let stringQuery = url.toString();
      console.log({url}, {stringQuery})

      let esc = encodeURIComponent;
      let query = Object.keys(obj)
          .map(k => esc(k) + '=' + esc(obj[k]))
          .join('&');
          console.log(query);

    // )
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
