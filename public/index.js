document.querySelector(".gpt-response");




// document.addEventListener('DOMContentLoaded', (event) => {
//     fetch('/openai')
//     .then (response => response.json())
//     .then(data => { 
//         {
//             let result = document.getElementById(".gpt-response");
//             result.innerHTML=`
//             <p>${data.choices[0].message.content}</p>`
//         }
//         console.log(data);
        
//     })
//     .catch(error => console.error('Error:', error));
// });




document.addEventListener('DOMContentLoaded', () => {
    fetch('/openai')
    .then(response => response.json())
    .then(data => { 
        const resultElement = document.querySelector(".gpt-response");
        if (resultElement) {
            resultElement.innerHTML = `<p>${data.choices[0].message.content}</p>`;
        } else {
            console.error('Error: Element with class "gpt-response" not found');
        }
    })
    .catch(error => console.error('Error:', error));
});
