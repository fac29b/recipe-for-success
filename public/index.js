
document.addEventListener("DOMContentLoaded", function () {
    const resultElement = document.querySelector(".gpt-response");
    const buttons = document.querySelectorAll("button");
    const darkLightButton = document.querySelector(".dark-light-button");
    const allergies = document.querySelector(".allergies");
    const title = document.querySelector("h1");
    const loadingContainer = document.querySelector("#loading-container");


    darkLightButton.addEventListener("change", () => {
        if (darkLightButton.checked) {
            allergies.style.setProperty('--green', 'rgb(67, 63, 63)');
            title.style.setProperty('--green', 'rgb(67, 63, 63)');
            resultElement.style.setProperty('--green', 'rgb(67, 63, 63)');
            buttons.forEach(button => {
                button.style.setProperty('--green', 'rgb(67, 63, 63)');
            });
        } else {
            allergies.style.setProperty('--green', 'rgb(183, 235, 183)');
            title.style.setProperty('--green', 'rgb(183, 235, 183)');
            resultElement.style.setProperty('--green', 'rgb(183, 235, 183)');
            buttons.forEach(button => {
                button.style.setProperty('--green', 'rgb(183, 235, 183)');
            });
        }
    });

    let recipeName;
    let lactoseIntolerant = false;
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            console.log("hello world");
            resultElement.innerHTML = '';
            recipeName = button.innerHTML;
            loadingContainer.style.display = "block";

            fetch("public/server.js", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ variable: recipeName })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response from the back-end", data);
                return fetch(`/openai?recipe=${encodeURIComponent(recipeName)}`);
            })
            .then(response => response.json())
            .then(data => { 
                if (resultElement) {
                    resultElement.innerHTML = `<p>${data.choices[0].message.content}</p>`;
                } else {
                    console.error('Error: Element with class "gpt-response" not found');
                }
            })
            .catch(error => console.error('Error:', error))
            .finally(() => {
                loadingContainer.style.display = "none";
            });
        });
    })
});
