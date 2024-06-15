// Get the video and canvas elements
const video = document.createElement('video');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

// Request access to the user's camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        // Set the video source and start playing
        video.srcObject = stream;
        video.play();
    })
    .catch((error) => {
        console.error('Error accessing camera:', error);
    });

// Function to capture a photo
function capturePhoto() {
    // Set the canvas dimensions to match the video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas as a base64-encoded string
    const imageData = canvas.toDataURL('image/png');

    // Do something with the captured photo (e.g., send it to a server)
    console.log('Captured photo:', imageData);
}

// Example usage: capture a photo when a button is clicked
const captureButton = document.getElementById('captureButton');
captureButton.addEventListener('click', () => {
    // Capture the photo
    capturePhoto();

    // Get the image data from the canvas as a base64-encoded string
    const imageData = canvas.toDataURL('image/png');

    // Send the image data to the backend
    fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => {
        if (response.ok) {
            console.log('Image uploaded successfully');
        } else {
            console.error('Failed to upload image');
        }
    })
    .catch(error => {
        console.error('Error uploading image:', error);
    });
});