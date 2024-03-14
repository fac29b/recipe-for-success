document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/openai')
    .then (response => response.json())
    .then(data => { console.log(data);
    })
    .catch(error => console.error('Error:', error));
});