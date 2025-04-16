// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Digitec & Galaxus Helper");
});

// Listener for API requests (optional example)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchPriceHistory") {
        fetch(request.url)
            .then(response => response.json())
            .then(data => sendResponse(data))
            .catch(error => console.error("Error fetching data:", error));
        return true; // Keeps the message channel open for async response
    }
});
