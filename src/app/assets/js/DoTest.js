// Initialize the current question index and number of chosen questions
var currentQuestionIndex = 0;
var numberOfChoosenQuestions = 0;

// Function to update the progress bar based on selected answers
function updateProgressBar() {
    var selectedOptions = document.querySelectorAll('input[type="radio"]:checked');
    var progressPercentage = (selectedOptions.length / totalQuestions) * 100;
    var progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = progressPercentage + "%";
    progressBar.setAttribute('aria-valuenow', progressPercentage);
}

// Function to ensure at least one question is checked before submission
document.querySelector("form").addEventListener("submit", function (event) {
    const answers = document.querySelectorAll("input[type='radio']:checked");
    if (answers.length === 0) {
        event.preventDefault();
        alert("Please select at least one answer before submitting.");
    }
});

// Function to update the number of selected questions and the progress bar
function updateChosenQuestions() {
    numberOfChoosenQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
    updateProgressBar();
}

// Add onchange event to all radio buttons after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', updateChosenQuestions);
    });
    updateProgressBar();
    showQuestion(currentQuestionIndex); // Show the first question
    startTimer(); // Start the timer
    noBack(); // Disable back button
});

// Function to hide all questions
function hideAllQuestions() {
    document.querySelectorAll('[id^="question-"]').forEach(function (question) {
        question.style.display = "none";
    });
}

// Function to show a specific question by index
function showQuestion(index) {
    hideAllQuestions();
    var currentQuestion = document.getElementById("question-" + index);
    if (currentQuestion) {
        currentQuestion.style.display = "block";
    }

    // Update active button in navigation
    document.querySelectorAll(".question-nav-buttons .btn").forEach((btn, i) => {
        btn.classList.toggle("active", i === index);
    });

    currentQuestionIndex = index;
    updateProgressBar();
}

// Function to ensure at least one question is checked before opening the modal
function openConfirmModal() {
    const selectedAnswers = document.querySelectorAll("input[type='radio']:checked");
    if (selectedAnswers.length === 0) {
        return; // Do not open the modal if no answers are selected
    }
    document.getElementById('customConfirmModal').style.display = 'block';
}

// Function to close the custom confirmation modal
function closeConfirmModal() {
    document.getElementById('customConfirmModal').style.display = 'none';
}

// Attach event listeners to the custom modal buttons
document.getElementById('confirmSubmit').addEventListener('click', function () {
    // If confirmed, submit the form
    document.querySelector('form').submit();
});

document.getElementById('cancelSubmit').addEventListener('click', function () {
    // If cancelled, close the modal and resume test
    closeConfirmModal();
});

// Modify the form submission to open the custom modal instead of blocking the timer
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default submit behavior
    openConfirmModal(); // Open the custom confirmation modal after validation
});

// Function to show the next question
function nextQuestion() {
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    } else {
        alert("You are on the last question.");
    }
}

// Timer function with countdown
function startTimer() {
    // Parse timeLeftString (e.g., "01:32:00") into total seconds
    var [hours, minutes, seconds] = timeLeftString.split(':').map(Number);
    var timeLeft = hours * 3600 + minutes * 60 + seconds;

    function updateTimer() {
        // Convert total seconds back to HH:MM:SS format
        var displayHours = Math.floor(timeLeft / 3600);
        var displayMinutes = Math.floor((timeLeft % 3600) / 60);
        var displaySeconds = timeLeft % 60;

        // Update the timer display with formatted time
        document.querySelector('.timer').textContent = `Time left: ${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;

        if (timeLeft > 0) {
            timeLeft--;
            setTimeout(updateTimer, 1000); // Call updateTimer every 1 second
        } else {
            alert('Time is up!');
            document.querySelector('form').submit();
        }
    }

    updateTimer(); // Initialize the timer display and start countdown
}

// Function to disable the back button
function noBack() {
    window.history.forward();
}
window.onpageshow = function (evt) {
    if (evt.persisted) noBack();
};
window.onunload = function () { null };
