document.addEventListener("DOMContentLoaded", function () {
    flatpickr("#ScheduleStartTime", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        defaultDate: new Date(),
        minuteIncrement: 1,
        time_24hr: true
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Initialize time-only picker for duration
    flatpickr("#ScheduleDuration", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        defaultHour: 0,
        defaultMinute: 30,
        minuteIncrement: 5 // Increment by 5 minutes for more control
    });
});