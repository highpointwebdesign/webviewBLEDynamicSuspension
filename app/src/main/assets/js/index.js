// Functions to connect and disconnect from Bluetooth device
function startBluetoothDiscovery() {
    
    document.getElementById("deviceListContainer").classList.remove("hide");
    document.getElementById("deviceList").innerHTML = ""
    BluetoothInterface.startDeviceDiscovery();
}

function handleDiscoveredDevices(devicesJson) {
    const devices = JSON.parse(devicesJson);
    const deviceList = document.getElementById("deviceList");

    // Clear any previous entries
    deviceList.innerHTML = '';

    // Create list items for each device
    devices.forEach(device => {
        const listItem = document.createElement("li");
        // <a href="#" class="item">
        //     <div class="in">
        //         <div>
        //             <header>Name</header>
        //             Gaspar Antunes
        //             <footer>London</footer>
        //         </div>
        //         <span class="text-muted">Edit</span>
        //     </div>
        // </a>
        // listItem.textContent = `${device.name} (${device.address})`;
        listItem.textContent = `${device.name} (${device.address})`;

        // Add a click listener to connect to the device when clicked
        listItem.addEventListener("click", () => {
            BluetoothInterface.connectToDevice(device.address);
        });

        deviceList.appendChild(listItem);
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


