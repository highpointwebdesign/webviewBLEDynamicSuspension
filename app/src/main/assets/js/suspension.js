// Handle Increment and Decrement Buttons
    document.querySelectorAll('.increment-btn, .decrement-btn').forEach(function(button) {
        button.addEventListener('click', function() {
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

            // Send the updated value to the ESP32 via Bluetooth
            // console.log(`Sending value ${value} for key ${key} to ESP32`);
            
            BluetoothInterface.savePreferencesToESP32(JSON.stringify({ [key]: value }));
        });
    });
    

// load preferences from esp32
    function loadPreferencesFromESP32() {
        // Example command to request preferences from ESP32
        // var key = "getPreferences"
        // var value = 1
        // BluetoothInterface.savePreferencesToESP32(JSON.stringify({ [key]: value }));
        BluetoothInterface.savePreferencesToESP32(JSON.stringify({ getPreferences: true }));

    }


// Called when Bluetooth data is received from the ESP32
    function onBluetoothDataReceived(responseData) {
        try {
            // Parse the JSON data received from the ESP32
            const data = JSON.parse(responseData);

            // Assuming data contains keys like rideHeightFL, smoothingFactor, etc.
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
            if (data.smoothingFactor !== undefined) {
                document.getElementById('smoothingFactor').value = data.smoothingFactor;
            }
            if (data.gain !== undefined) {
                document.getElementById('gain').value = data.gain;
            }
            if (data.minRideHeight !== undefined) {
                document.getElementById('minRideHeight').value = data.minRideHeight;
            }
            if (data.maxRideHeight !== undefined) {
                document.getElementById('maxRideHeight').value = data.maxRideHeight;
            }

            // Add any additional logic if needed to handle new keys in the received data
            console.log('Data received and parsed:', data);

        } catch (error) {
            console.error('Error parsing Bluetooth data:', error);
        }
    }

// This function will be called by the native Android app when Bluetooth data is received
    function handleBluetoothData(data) {
        // Log the received data to the console
        showAndroidToast('handleBluetoothData line 81')

        // Further processing of data here...
    }




// Function to update form fields with values received from ESP32
function updateFormFields(parsedData) {
    showAndroidToast(parsedData.minRideHeight);

    try {
        // Assuming data contains keys like rideHeightFL, smoothingFactor, etc.
        if (parsedData) {
            //  ride height
            if (parsedData.minRideHeight !== undefined) {
                document.getElementById('minRideHeight').value = parsedData.minRideHeight;
            }
            if (parsedData.maxRideHeight !== undefined) {
                document.getElementById('maxRideHeight').value = parsedData.maxRideHeight;
            }

            //  servo data
            if (parsedData.rideHeightFL !== undefined) {
                document.getElementById('rideHeightFL').value = parsedData.rideHeightFL;
            }
            if (parsedData.rideHeightFR !== undefined) {
                document.getElementById('rideHeightFR').value = parsedData.rideHeightFR;
            }
            if (parsedData.rideHeightRL !== undefined) {
                document.getElementById('rideHeightRL').value = parsedData.rideHeightRL;
            }
            if (parsedData.rideHeightRR !== undefined) {
                document.getElementById('rideHeightRR').value = parsedData.rideHeightRR;
            }

            //  chassis rebound control
            // if (parsedData.smoothingFactor !== undefined) {
            //     document.getElementById('smoothingFactor').value = parsedData.smoothingFactor;
            // }
            // if (parsedData.gain !== undefined) {
            //     document.getElementById('gain').value = parsedData.gain;
            // }
        } else {
            throw new Error('No data received.');
        }
    } catch (error) {
        // Output error details to the error log
        const errorLog = document.getElementById('error-log');
        errorLog.innerHTML += `Error: ${error.message}\nStack: ${error.stack}\n\n`;
    }

   
    showAndroidToast('done');
}

function showDebugLog(data){
    const showDebugLog = document.getElementById('error-log');
    showDebugLog.innerHTML += data + '\n\n';

}

// Handle the Bluetooth response from ESP32
function onBluetoothInterface_valueReturnedFromSendKeyValuePair(data) {
    // Assuming data is in JSON format
    showAndroidToast("data base from esp32!");
    showDebugLog(data);

    const parsedData = JSON.parse(data);
    updateFormFields(parsedData);
}

// Register the handler to be called when data is received
window.onload = function() {
    // Set up the connection and send request when the page loads
    loadPreferencesFromESP32();


            
    //  BluetoothInterface.receiveData(onBluetoothDataReceived);
};
