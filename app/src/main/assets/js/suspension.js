// Transaction log update function
function updatetransactionLog(message) {
    const logElement = document.getElementById(`transactionLog`); // Make sure this element exists in your HTML
    logElement.innerHTML = `${new Date().toLocaleTimeString()}: ${message}<br>` + logElement.innerHTML;
    // Keep only the last 10 entries
    const entries = logElement.innerHTML.split(`<br>`);
    if (entries.length > 20) { // Adjust to keep more entries if needed
        logElement.innerHTML = entries.slice(0, 20).join(`<br>`);
    }
}

// Optimistic update for increment/decrement buttons
function handleIncrementDecrementButtons() {
    updatetransactionLog(`Attaching event handlers`);

    document.querySelectorAll(`.increment-btn, .decrement-btn`).forEach(function(button) {
        button.addEventListener(`click`, function() {
            var key = this.getAttribute(`data-key`);
            var input = document.getElementById(key);
            var currentValue = parseInt(input.value);
            if (isNaN(currentValue)) {
                updatetransactionLog(`Current value is not a number, maintaining previous value.`);
                return; // Don't change anything if the current value isn't valid
            } else {
                var increment = this.classList.contains(`increment-btn`) ? 5 : -5;
                var newValue = currentValue + increment;

                // Prevent newValue from going below 0
                if (newValue < 0) {
                    newValue = 0;
                }

                // Now update the input field and proceed
                input.value = newValue;

                updatetransactionLog(`Key: ${key}, Optimistic Value: ${newValue}`);

                // Debounce sending the update
                updatetransactionLog(`debounceSendUpdate`);
                debounceSendUpdate(key, newValue);
            }

        });
    });
}

// Debounce implementation to prevent frequent sends
let debounceTimer;
function debounceSendUpdate(key, value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // Log the sending of data
        updatetransactionLog(`Sending to ESP32: ${key} = ${value}`);
        BluetoothInterface.savePreferencesToESP32(JSON.stringify({ [key]: value }));

        // Reload preferences after updating
        loadPreferencesFromESP32();
    }, 1000); // 1 second delay before sending updates to the ESP32
}

// Load preferences from ESP32
function loadPreferencesFromESP32() {
    // showLoading();
    updatetransactionLog(`Requesting updated preferences from ESP32`);
    BluetoothInterface.requestPreferencesFromESP32();
}

// Handle incoming data from ESP32
function onBluetoothDataReceived(responseData) {
    // hideLoading();
    try {
        const data = JSON.parse(responseData);
        // Update the UI with new data
        [`minRideHeight`, `maxRideHeight`, `rideHeightFL`, `rideHeightFR`, `rideHeightRL`, `rideHeightRR`].forEach(id => {
            if (data[id] !== undefined) {
                document.getElementById(id).value = data[id];
                updatetransactionLog(`Updated ${id} to ${data[id]}`);
            }
        });
    } catch (error) {
        updatetransactionLog(`Error parsing data: ${error.message}`);
    }
}

// Initial setup function to be called when the page loads
// function initPage() {
//     showLoading();
//     loadPreferencesFromESP32();  
//     handleIncrementDecrementButtons();
//     // updatetransactionLog(`suspenion init [L270]`)
//     hideLoading(); 
// }

async function initPage() {
    try {
        showLoading();
        await loadPreferencesFromESP32();  
        handleIncrementDecrementButtons();
    } catch (error) {
        console.error(`Failed to load preferences:`, error);
    } finally {
        hideLoading(); 
    }
}


// Attach initPage to window.onload to ensure it runs when the page is fully loaded
// window.onload = initPage;
