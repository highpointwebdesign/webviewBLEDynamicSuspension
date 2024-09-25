#include <Preferences.h>
#include <ESP32Servo.h>
#include "BluetoothSerial.h"
#include <ArduinoJson.h>

Preferences preferences;
BluetoothSerial SerialBT;

Servo servos[4]; // Array for 4 servos

// Constants for preference keys and defaults
const char* servoKeys[4] = {"rideHeightFL", "rideHeightFR", "rideHeightRL", "rideHeightRR"};
const char* smoothingFactorKey = "smoothingFactor";
const char* speedKey = "speed";
const char* minHeightKey = "minRideHeight";
const char* maxHeightKey = "maxRideHeight";
const int servoPins[4] = {13, 14, 27, 26}; // GPIO pins for the servos
const String bluetoothDeviceName = "Dynamic Drive";

// Default settings
const int defaultRideHeight = 90;
const float defaultSmoothingFactor = 0.8;
const float defaultSpeed = 1.0;
const int defaultMinRideHeight = 0;
const int defaultMaxRideHeight = 180;

// Runtime variables
float smoothingFactor, speed;
int minRideHeight, maxRideHeight;
bool isConnected = false;

// Global variables to manage the flashing state
int ledState = LOW;         // Start with the LED off
unsigned long previousMillis = 0;  // Stores the last time the LED was updated
const long interval = 350;  // Interval at which to blink (milliseconds)


void setup() {
    Serial.begin(115200);
    pinMode(2, OUTPUT); // Set GPIO 2 as output

    if (!SerialBT.begin(bluetoothDeviceName)) {
        Serial.println("An error occurred initializing Bluetooth");
    } else {
        Serial.println("Bluetooth initialized. Device is discoverable as " + bluetoothDeviceName);
    }
    preferences.begin("suspension", false);
    loadPreferences();
    attachAndInitializeServos();
}

void loadPreferences() {
    // Load general settings
    smoothingFactor = preferences.getFloat(smoothingFactorKey, defaultSmoothingFactor);
    speed = preferences.getFloat(speedKey, defaultSpeed);
    minRideHeight = preferences.getInt(minHeightKey, defaultMinRideHeight);
    maxRideHeight = preferences.getInt(maxHeightKey, defaultMaxRideHeight);

    // Load servo ride heights
    int servoRideHeights[4]; // Array to store the ride heights for each servo
    for (int i = 0; i < 4; i++) {
        servoRideHeights[i] = preferences.getInt(servoKeys[i], defaultRideHeight);
        Serial.printf("Servo %d (Key: %s) ride height loaded: %d\n", i + 1, servoKeys[i], servoRideHeights[i]);
    }

    // Print loaded settings
    Serial.printf("Settings Loaded: Min Height: %d, Max Height: %d, Smoothing: %.2f, Speed: %.2f\n",
                  minRideHeight, maxRideHeight, smoothingFactor, speed);
}


void attachAndInitializeServos() {
    for (int i = 0; i < 4; i++) {
        servos[i].attach(servoPins[i]);
        int rideHeight = preferences.getInt(servoKeys[i], defaultRideHeight);
        rideHeight = constrain(rideHeight, minRideHeight, maxRideHeight);
        preferences.putInt(servoKeys[i], rideHeight); // Store constrained value
        servos[i].write(rideHeight);
        Serial.printf("Servo %d set to ride height %d\n", i + 1, rideHeight);
    }
}

void loop() {
    handleBluetoothConnection();
    processBluetoothCommands();
}

void handleBluetoothConnection() {
    if (SerialBT.hasClient()) {
        if (!isConnected) {
            isConnected = true;
            Serial.println("Bluetooth device connected.");
            flashLED(1);
        }
    } else {
        if (isConnected) {
            isConnected = false;
            Serial.println("Bluetooth device disconnected.");
            flashLED(5);
        }
    }
}

void processBluetoothCommands() {
    if (SerialBT.available()) {
        String incomingData = SerialBT.readStringUntil('\n');
        StaticJsonDocument<400> doc, responseDoc;
        if (deserializeJson(doc, incomingData)) {
            Serial.println("Failed to parse JSON");
            SerialBT.println("{\"error\":\"Failed to parse JSON\"}");
            return;
        }
        for (JsonPair kv : doc.as<JsonObject>()) {
            handleKey(kv.key().c_str(), kv.value().as<int>(), responseDoc);
        }
        String response;
        serializeJson(responseDoc, response);
        SerialBT.println(response);
        Serial.println(response);
    }
}

void handleKey(const String& key, int value, JsonDocument& responseDoc) {
    if (key == "getPreferences") {
        getAllPreferences(responseDoc);
    } else if (std::find(std::begin(servoKeys), std::end(servoKeys), key) != std::end(servoKeys)) {
        updateServoHeight(key, value, responseDoc);
    } else if (key == minHeightKey || key == maxHeightKey) {
        updateMinMaxHeight(key, value, responseDoc);
    } else if (key == "gyroData") {
      float x = doc["x"];
      float y = doc["y"];
      float z = doc["z"];
      Serial.println("X: " + key);
      Serial.println("Y: " + key);
      Serial.println("Z: " + key);
      // Logic to convert gyro data to servo positions
    }

    } else {
        responseDoc["error"] = "Invalid key: " + key;
        Serial.println("Invalid key received: " + key);
    }
}



void getAllPreferences(JsonDocument& responseDoc) {
    responseDoc["minRideHeight"] = preferences.getInt(minHeightKey, defaultMinRideHeight);
    responseDoc["maxRideHeight"] = preferences.getInt(maxHeightKey, defaultMaxRideHeight);

    for (const auto& key : servoKeys) {
        responseDoc[key] = preferences.getInt(key, defaultRideHeight);
    }

    responseDoc["smoothingFactor"] = preferences.getFloat(smoothingFactorKey, defaultSmoothingFactor);
    responseDoc["speed"] = preferences.getFloat(speedKey, defaultSpeed);
    flashLED(1); //quick flash to indicate LoadPrefs was run
    Serial.println("All preferences sent.");
}


void updateServoHeight(const String& key, int value, JsonDocument& responseDoc) {
    int index = -1;
    for (int i = 0; i < 4; i++) {
        if (key == servoKeys[i]) {
            index = i;
            break;
        }
    }
    if (index == -1) return; // Key not found

    int rideHeight = constrain(value, minRideHeight, maxRideHeight);
    preferences.putInt(servoKeys[index], rideHeight);
    if (servos[index].attached()) {
        servos[index].write(rideHeight);
        Serial.printf("Updated %s to %d\n", key.c_str(), rideHeight);
    } else {
        Serial.printf("Servo %d not attached, skipping\n", index + 1);
    }
    // responseDoc[key] = rideHeight;
    getAllPreferences(responseDoc);  // Fetch and add all preferences to the response

}

void updateMinMaxHeight(const String& key, int value, JsonDocument& responseDoc) {
    int newValue = constrain(value, defaultMinRideHeight, defaultMaxRideHeight);
    preferences.putInt(key.c_str(), newValue); // Convert String to const char* using c_str()
    if (key == minHeightKey) {
        minRideHeight = newValue;
        // Adjust servos if the new minimum height is greater than current servo positions
        adjustServosForNewMinHeight();
    } else if (key == maxHeightKey) {
        maxRideHeight = newValue;
        // Adjust servos if the new maximum height is less than current servo positions
        adjustServosForNewMaxHeight();
    }
    Serial.printf("Updated %s to %d\n", key.c_str(), newValue);
    getAllPreferences(responseDoc);  // Fetch and add all preferences to the response
}

void adjustServosForNewMinHeight() {
    for (int i = 0; i < 4; i++) {
        int currentHeight = preferences.getInt(servoKeys[i], defaultRideHeight);
        if (currentHeight < minRideHeight) {
            servos[i].write(minRideHeight);
            preferences.putInt(servoKeys[i], minRideHeight);
            Serial.printf("Adjusted %s to minimum height %d\n", servoKeys[i], minRideHeight);
        }
    }
}

void adjustServosForNewMaxHeight() {
    for (int i = 0; i < 4; i++) {
        int currentHeight = preferences.getInt(servoKeys[i], defaultRideHeight);
        if (currentHeight > maxRideHeight) {
            servos[i].write(maxRideHeight);
            preferences.putInt(servoKeys[i], maxRideHeight);
            Serial.printf("Adjusted %s to maximum height %d\n", servoKeys[i], maxRideHeight);
        }
    }
}


void flashLED(int numFlashes) {
    static int flashesRemaining = 0; // How many flashes are left to do
    static bool isFlashing = false;  // Is the LED currently flashing?
    
    if (numFlashes > 0) {
        flashesRemaining = numFlashes * 2; // Times two for ON and OFF states
        isFlashing = true;
        previousMillis = millis(); // Reset the timing
    }

    if (isFlashing) {
        unsigned long currentMillis = millis();

        if ((currentMillis - previousMillis) >= interval) {
            // Save the last time you toggled the LED
            previousMillis = currentMillis;

            // If the LED is off turn it on and vice-versa:
            if (ledState == LOW) {
                ledState = HIGH;
            } else {
                ledState = LOW;
                flashesRemaining--;
            }

            digitalWrite(2, ledState); // Set the LED with the ledState of the variable

            // Check if we are done flashing
            if (flashesRemaining <= 0) {
                isFlashing = false;
                digitalWrite(2, LOW); // Ensure LED is turned off after flashing
            }
        }
    }
}


