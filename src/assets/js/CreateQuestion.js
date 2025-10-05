
function correctAnswerValidation() {
    const correctAnswer = document.querySelector('input[name="CorrectAnswer"]').value.trim().toUpperCase();
    const validAnswers = ['A', 'B', 'C', 'D'];

    if (!validAnswers.includes(correctAnswer)) {
        alert('Correct answer must be A, B, C, or D.');
        return false; // Prevent form submission
    }

    return true; // Allow form submission
}
