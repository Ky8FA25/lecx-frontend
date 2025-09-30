// Show/Hide the "Number of Max Attempt" field based on the "Allow Redo" selection
document.getElementById('allowRedo').addEventListener('change', function () {
    var maxAttemptDiv = document.getElementById('maxAttemptDiv');
    if (this.value === 'Yes') {
        maxAttemptDiv.style.display = 'block';
    } else {
        maxAttemptDiv.style.display = 'none';
    }
});

// Date validation function
function validateDates() {
    var startDate = new Date(document.getElementsByName('StartTime')[0].value);
    var endDate = new Date(document.getElementsByName('EndTime')[0].value);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert("Please enter valid start and end dates.");
        return false;
    }

    if (startDate.getTime() >= endDate.getTime()) {
        alert("End Date must be after Start Date.");
        return false;
    }

    return true;
}

// Trigger the change event on page load to set the initial state
document.getElementById('allowRedo').dispatchEvent(new Event('change'));
