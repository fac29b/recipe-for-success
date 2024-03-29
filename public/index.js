const resultElement = document.querySelector(".gpt-response");
const buttons = document.querySelectorAll("button");
let recipeName;
let lactoseIntolerant = false;
buttons.forEach(button => {
    button.addEventListener("click", () => {
      console.log("hello world")
      recipeName = button.innerHTML;
      fetch("public/server.js", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        }, 
        body: JSON.stringify({variable: recipeName})
      })
      .then(response => response.json())
      .then(data => {
        console.log("Response from the back-end", data)
      })
      .catch(error => {
        console.error("Error", error)
      })
      fetch('/openai')
      .then(response => response.json())
      .then(data => { 
          if (resultElement) {
              resultElement.innerHTML = `<p>${data.choices[0].message.content}</p>`;
          } else {
              console.error('Error: Element with class "gpt-response" not found');
          }
      })
      .catch(error => console.error('Error:', error));
    })
  })







