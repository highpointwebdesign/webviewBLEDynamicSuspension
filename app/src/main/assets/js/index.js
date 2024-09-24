// Functions to connect and disconnect from Bluetooth device
function startBluetoothDiscovery() {
    
    //  document.getElementById("deviceListContainer").classList.remove("hide");
    //  document.getElementById("deviceList").innerHTML = ""
    try {
        BluetoothInterface.startDeviceDiscovery();
        updatetransactionLog('startBluetoothDiscovery');
    } catch (error) {
        updatetransactionLog('Error')
        updatetransactionLog('Error: ' + error.message + '\nStack: ' + error.stack + '\n\n');
    }
    hideLoading();
}

function handleDiscoveredDevices(devicesJson) {
    const devices = JSON.parse(devicesJson);
    const deviceList = document.getElementById("deviceList");

    // // Clear any previous entries
    // deviceList.innerHTML = '';

    // // Create list items for each device
    // devices.forEach(device => {
    //     const listItem = document.createElement("li");
    //     listItem.textContent = `${device.name} (${device.address})`;

    //     // Add a click listener to connect to the device when clicked
    //     listItem.addEventListener("click", () => {
    //         BluetoothInterface.connectToDevice(device.address);
    //     });

    //     deviceList.appendChild(listItem);
    // });

    // Clear any previous results before appending new ones
    deviceList.innerHTML = "";

    // Create buttons for each device
    devices.forEach(device => {
        const button = document.createElement("button");
        
        // Set the button's attributes and classes
        button.type = "button";
        button.className = "btn btn-text-primary btn-block rounded shadowed me-1 mb-1";
        
        // Set the button text to the device's name and address
        button.textContent = device.name;

        // Add a click listener to connect to the device when clicked
        button.addEventListener("click", () => {
            BluetoothInterface.connectToDevice(device.address);
        });

        // Append the button to the device list container
        deviceList.appendChild(button);
    });

}

function connectToDevice(address) {
    console.log("Attempting to connect to device:", address);
    BluetoothInterface.connectToDevice(address);
}

function handleBluetoothData(responseData) {
    console.log("Data from ESP32:", responseData);
    // Process the data received from ESP32
}

// function sendDataToESP32(key, value) {
//     console.log(key)
//     console.log(value);
//     console.log("Send button clicked");
//     const data = JSON.stringify({ [key]: value });
//     BluetoothInterface.sendData(data);
// }

function disconnectFromESP32() {
    console.log("Disconnect button clicked");
    BluetoothInterface.disconnect();
}

// // Register the handler when the page loads
// window.onload = function() {
//     updatetransactionLog('Loading preferences [L132]')
//     startBluetoothDiscovery();
// };
