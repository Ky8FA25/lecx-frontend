const connection = new signalR.HubConnectionBuilder()
    .withUrl("/testHub")
    .build();

connection.on("TestStarted", function (testId) {
    console.log("TestStarted event received for testId:", testId); // Log when the event is received
    const doTestButton = document.getElementById(`doTestButton-${testId}`);
    if (doTestButton) {
        doTestButton.disabled = false;
        doTestButton.classList.remove("btn-secondary");
        doTestButton.classList.add("btn-success");
        doTestButton.textContent = "Do Test";
    }
});

connection.start()
    .then(() => console.log("SignalR connected successfully")) // Log connection success
    .catch(err => console.error("Error connecting SignalR:", err.toString()));
