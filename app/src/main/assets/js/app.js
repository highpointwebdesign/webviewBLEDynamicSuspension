const actionWords = ['Climb', 'Crawl', 'Drift', 'Trail', 'Race', 'Challenge', 'Expedition', 'Scramble', 'Slide', 'Path', 'Dash', 'Encounter', 'Adventure'];
const colors = ['#FF4500', '#228B22', '#1E90FF', '#FFD700', '#FF6347', '#00CED1', '#FF8C00', '#8A2BE2', '#6495ED', '#32CDFF', '#FF6347', '#FF00FF', '#c92bc7'];


let index = 0;

function rotateWords() {
    const actionWordElement = document.getElementById('actionWord');
    actionWordElement.innerText = actionWords[index];
    actionWordElement.style.color = colors[index];  // Change color as the word cycles
    index = (index + 1) % actionWords.length;
}

setInterval(rotateWords, 1000);  // Rotate every 2 seconds

// Initialize all popovers
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
        trigger: 'click'
    });
});

// Close all popovers before opening a new one
popoverTriggerList.forEach(function (popoverTriggerEl, index) {
    popoverTriggerEl.addEventListener('click', function () {
        popoverList.forEach(function (popover, i) {
            if (i !== index) {
                popover.hide(); // Hide all other popovers
            }
        });
    });
});

function getCurrentYearForCopy(){
    const d = new Date();
    let year = d.getFullYear();
    document.getElementById("thisYear").innerHTML = year;
}

function updateHostDetails(){
    console.log('init');
    const esp32hostname = 'ESP112943';    
    const esp32hostid = '10:11:14:ab:p2';    
    
    document.getElementById("esp32hostname").innerHTML = esp32hostname;
    document.getElementById("esp32hostid").innerHTML = esp32hostid;
}



// Functions to connect and disconnect from Bluetooth device
function startBluetoothDiscovery() {
    document.getElementById("deviceList").innerHTML = "<em>Searching...</em>"
    BluetoothInterface.startDeviceDiscovery();
}

function handleDiscoveredDevices(devicesJson) {
    const devices = JSON.parse(devicesJson);
    const deviceList = document.getElementById("deviceList");

    // Clear any previous entries
    deviceList.innerHTML = '<div class="listview-title mt-2">Discovered Devices</div>';

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

function resetGyro() {
    const key = "mpureset";
    const value = 1;
    console.log("Reset Gyro button clicked");
    const data = JSON.stringify({ [key]: value });
    BluetoothInterface.sendData(data);
}

window.onload = function(event) {
    updateHostDetails();
};
