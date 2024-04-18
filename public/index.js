const resultElement = document.querySelector(".gpt-response");
const headline = document.querySelector(".headline");
const lactoseIntolerant = document.querySelector("#lactose-intolerant");
const vegan = document.querySelector("#vegan");
const loadingContainer = document.querySelector("#loading-container");
const allergies = document.querySelector(".allergies");
const darkLightButton = document.querySelector(".dark-light-button");
const buttons = document.querySelectorAll("button");
const dietaryRequirements = Array.from(document.querySelectorAll(".dietary-requirements"));
console.log(dietaryRequirements)
let isLactoseIntolerant;
let dishOriginCountry;

darkLightButton.addEventListener("change", ()=> {
  let color = darkLightButton.checked ? "rgb(67, 63, 63)" : "rgb(183, 235, 183)";
  [resultElement, lactoseIntolerant, allergies, headline, ...buttons].forEach(element => {
    element.style.setProperty('--green', color);
    element.style.transition = 'background-color 0.5s ease';
  })
})
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    let obj = {
      [button.name]: button.value,
      
    }
    dietaryRequirements.forEach(dietaryRequirement => {
      obj[dietaryRequirement.name] = dietaryRequirement.checked

    })

    dishOriginCountry = button.value;
    loadingContainer.style.display = "block";
    resultElement.innerHTML = '';
    fetch("public/server.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from the back-end", data);
      })
      .catch((error) => {
        console.error("Error", error);
      });


    
      // let obj = {
      //   [button.name]: button.value,
      //   is_lactose_intolerant: lactoseIntolerant.checked,
      //   is_vegan: vegan.checked,
      // }
     


    

      


    
      // let url = new URLSearchParams(obj)
      // let stringQuery = url.toString();
      // console.log({url}, {stringQuery})

      let esc = encodeURIComponent;
      let query = Object.keys(obj)
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
      .catch((error) => console.error("Error:", error))
      .finally(() => {
        loadingContainer.style.display = "none";
      });
   
  });

});
