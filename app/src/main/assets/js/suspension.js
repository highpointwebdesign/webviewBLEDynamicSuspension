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
            console.log(`Sending value ${value} for key ${key} to ESP32`);
            BluetoothInterface.sendData(JSON.stringify({ [key]: value }));
        });
    });
    

// load preferences from esp32
    function loadPreferencesFromESP32() {
        // Example command to request preferences from ESP32
        console.log('loadPreferencesFromESP32');
        alert('loadPreferencesFromESP32');
        BluetoothInterface.sendData(JSON.stringify({ getPreferences}));
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
        console.log('Received data from Bluetooth:', data);

        // You can also show an alert to confirm data is received
        alert('Received data: ');

        // Further processing of data here...
    }




// Function to update form fields with values received from ESP32
function updateFormFields(preferences) {
    console.log('updateFormFields');
    document.getElementById('rideHeight').value = preferences.rideHeight || 0;
    document.getElementById('balance').value = preferences.balance || 0;
    document.getElementById('damping').value = preferences.damping || 0;
}

// Handle the Bluetooth response from ESP32
function onBluetoothDataReceived(data) {
    // Assuming data is in JSON format
    console.log('onBluetoothDataReceived');
    alert('data received ' + data)
    const preferences = JSON.parse(data);
    updateFormFields(preferences);
}

// Register the handler to be called when data is received
window.onload = function() {
    // Set up the connection and send request when the page loads
        console.log('init loadPreferencesFromESP32');

    loadPreferencesFromESP32();

    // Assuming BluetoothInterface has a receiveData function
            console.log('handle onBluetoothDataReceived');

    BluetoothInterface.receiveData(onBluetoothDataReceived);
};
