function handleIncrementDecrementButtons(){    
    // Handle Increment and Decrement Buttons
    updatetransactionLog('init - + buttons [L3]')

    document.querySelectorAll('.increment-btn, .decrement-btn').forEach(function(button) {
        button.addEventListener('click', function() {
             disableButtons()
            var key = this.getAttribute('data-key');
            var input = document.getElementById(key);
            var value = parseInt(input.value);

            if (this.classList.contains('increment-btn')) {
                value += 5;
            } else {
                value -= 5;
            }

            // Ensure value doesn't go below 0 (or set your own constraints)
            if (value < 0) value = 0;

            input.value = value;

            updatetransactionLog('Key:' + key + ' value:' + value)
            updatetransactionLog('Saving updates')
            BluetoothInterface.savePreferencesToESP32(JSON.stringify({ [key]: value }));
            
            //  updatetransactionLog('Retrieving Preference data [L24]')
            //  loadPreferencesFromESP32();
        });
    });
}

function cleanUpJSON(jsonString) {

        updatetransactionLog(jsonString)

    // Trim the input string to remove any leading or trailing whitespace
    jsonString = jsonString.trim();

    try {
        // Attempt to parse the JSON to see if it's already valid
        JSON.parse(jsonString);
        return jsonString; // If no error, return the original string
    } catch (error) {
        // If an error occurs, proceed to clean up
        // Find the first index of a closing brace followed by a starting brace
        const index = jsonString.indexOf('}{');
        if (index !== -1) {
            // Slice the string from the start to the first index of closing brace + 1 to get a valid JSON
            const cleanedJsonString = jsonString.slice(0, index + 1);
            // Attempt to parse the cleaned string to ensure it's valid JSON
            try {
                JSON.parse(cleanedJsonString);
                return cleanedJsonString; // Return the cleaned and trimmed JSON string
            } catch (error) {
                // Log error if the cleaned string is still not valid JSON
                console.error("Failed to clean the JSON string: ", error);
                return null; // Return null or handle as needed
            }
        } else {
            // Log error if no closing brace followed by an opening brace is found
            console.error("Invalid JSON format and unable to clean");
            return null; // Return null or handle as needed
        }
    }
}

// // Example usage:
// const jsonString = `{"minRideHeight":25,"maxRideHeight":155,"rideHeightFL":75,"rideHeightFR":95,"rideHeightRL":90,"rideHeightRR":95{"minRideHeight":25,"maxRideHeight":155,"rideHeightFL":75,"rideHeightFR":95,"rideHeightRL":90,"rideHeightRR":95}`;
// const cleanedJson = cleanUpJSON(jsonString);
// updatetransactionLog(cleanedJson);


// Load preferences from ESP32
function init() {
    updatetransactionLog('Get Preference data [L31]')
    BluetoothInterface.requestPreferencesFromESP32();
    // on to onBluetoothDataReceived
}

// Called when Bluetooth data is received from the ESP32
function onBluetoothDataReceived(responseData) {
    updatetransactionLog('Retrieved Preference data [L80]')
    updatetransactionLog('cleaning up json data')
    const cleanedJson = cleanUpJSON(responseData);
    updatetransactionLog('json data cleaned')



    updatetransactionLog('Populating form fields')
    updatetransactionLog(cleanedJson)
    

    const data = JSON.parse(cleanedJson);
    
    try {
        if (data) {
            // Parse the JSON data received from the ESP32

            if (data.maxRideHeight !== undefined) {
                document.getElementById('maxRideHeight').value = data.maxRideHeight;
            }
            if (data.minRideHeight !== undefined) {
                document.getElementById('minRideHeight').value = data.minRideHeight;
            }

            if (data.rideHeightFL !== undefined) {
                document.getElementById('rideHeightFL').value = data.rideHeightFL;
            }
            if (data.rideHeightFR !== undefined) {
                document.getElementById('rideHeightFR').value = data.rideHeightFR;
            }
            if (data.rideHeightRL !== undefined) {
                document.getElementById('rideHeightRL').value = data.rideHeightRL;
            }
            if (data.rideHeightRR !== undefined) {
                document.getElementById('rideHeightRR').value = data.rideHeightRR;
            }

        // if (data.balance !== undefined) {
        //     document.getElementById('balance').value = data.balance;
        // }
        // if (data.decay !== undefined) {
        //     document.getElementById('decay').value = data.decay;
        // }
        // if (data.speed !== undefined) {
        //     document.getElementById('speed').value = data.speed;
        // }

        // showAndroidToast('Loaded');
        updatetransactionLog('Form populated')

         enableButtons();
        } else {
            updatetransactionLog('No data received')
            throw new Error('No data received.');
        }
    } catch (error) {
        updatetransactionLog('Error')
        updatetransactionLog('Error')
        updatetransactionLog('Error: ' + error.message + '\nStack: ' + error.stack + '\n\n');

         enableButtons();
    }
    hideLoading();
}

function disableButtons() {
    updatetransactionLog('Disable buttons')
    // document.querySelectorAll('.increment-btn, .decrement-btn').forEach(function(button) {
    //     button.disabled = true;
    // });
    hideLoading();
}

// Enable buttons after processing is complete
function enableButtons() {
    updatetransactionLog('Renable buttons')
    showLoading();
    // document.querySelectorAll('.increment-btn, .decrement-btn').forEach(function(button) {
        // button.disabled = false;
    // });
}

// // Register the handler when the page loads
// window.onload = function() {
//     // disableButtons();
//     handleIncrementDecrementButtons();
//     updatetransactionLog('Loading preferences [L132]')
//     loadPreferencesFromESP32();    
// };
