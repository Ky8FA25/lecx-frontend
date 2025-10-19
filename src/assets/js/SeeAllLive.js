function setStreamKey(streamKey) {
    // Set the stream key text in the modal
    const modalId = event.target.getAttribute('data-bs-target');
    document.querySelector(modalId + ' #streamKeyText-' + modalId.split('-')[1]).textContent = streamKey;
}
// Function to validate that the scheduled start time is not in the past
function validateStartTime() {
    const startTimeInput = document.getElementById('scheduleStartTime-@live.livestreamid');
    const selectedStartTime = new Date(startTimeInput.value);
    const currentTime = new Date(); // Get the current time

    // Check if the selected start time is in the past
    if (selectedStartTime < currentTime) {
        startTimeInput.setCustomValidity('Scheduled start time cannot be in the past.');
        startTimeInput.reportValidity();
    } else {
        startTimeInput.setCustomValidity(''); // Clear custom validity message
    }
}

// Add event listeners to the input for change and input events
document.getElementById('scheduleStartTime-@live.livestreamid').addEventListener('input', validateStartTime);
document.getElementById('scheduleStartTime-@live.livestreamid').addEventListener('change', validateStartTime);