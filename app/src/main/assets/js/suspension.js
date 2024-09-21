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
            
            //  updatetransactionLog('Retrieving preference data [L24]')
            //  loadPreferencesFromESP32();
        });
    });
}

function loadData(){
    document.getElementById('loadData').addEventListener('click', loadPreferencesFromESP32);
    updatetransactionLog('Retrieving preference data [L34]')
}

// Load preferences from ESP32
function loadPreferencesFromESP32() {
    updatetransactionLog('Retrieving preference data [L31]')
    BluetoothInterface.requestPreferencesFromESP32();
    // on to onBluetoothDataReceived
}

// Called when Bluetooth data is received from the ESP32
function onBluetoothDataReceived(responseData) {
    updatetransactionLog(responseData)
    updatetransactionLog('Populating form fields')

    const data = JSON.parse(responseData);
    
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
}

// Function to handle response after sending data to ESP32
// function onBluetoothInterface_valueReturnedFromSendKeyValuePair(data) {
//     showDebugLog("Data received from ESP32!");
//     const parsedData = JSON.parse(data);
//     updateFormFields(parsedData);
// }

// Update form fields
// function updateFormFields(parsedData) {
//     // showAndroidToast(parsedData.minRideHeight);

//     try {
//         if (parsedData) {
//             if (parsedData.minRideHeight !== undefined) {
//                 document.getElementById('minRideHeight').value = parsedData.minRideHeight;
//             }
//             // Repeat for other fields...
//         } else {
//             throw new Error('No data received.');
//         }
//     } catch (error) {
//         const errorLog = document.getElementById('error-log');
//         errorLog.innerHTML += 'Error: ${error.message}\nStack: ${error.stack}\n\n';
//     }

//     // showAndroidToast('Done');
// }

function disableButtons() {
    updatetransactionLog('Disable buttons')
    // document.querySelectorAll('.increment-btn, .decrement-btn').forEach(function(button) {
    //     button.disabled = true;
    // });
}

// Enable buttons after processing is complete
function enableButtons() {
    updatetransactionLog('Renable buttons')
    // document.querySelectorAll('.increment-btn, .decrement-btn').forEach(function(button) {
        // button.disabled = false;
    // });
}

// Register the handler when the page loads
window.onload = function() {
    // disableButtons();
    handleIncrementDecrementButtons();
    updatetransactionLog('Loading preferences [L132]')
    loadPreferencesFromESP32();

    loadData();
    
};
