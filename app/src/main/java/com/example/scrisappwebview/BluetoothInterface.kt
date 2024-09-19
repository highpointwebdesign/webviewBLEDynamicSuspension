package com.example.scrisappwebview

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.core.content.ContextCompat
import java.io.IOException
import java.io.OutputStream
import java.util.UUID
import org.json.JSONArray
import org.json.JSONObject

class BluetoothInterface(private val context: MainActivity, private val myWebView: WebView) {
    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null
    private val handler = Handler(Looper.getMainLooper())
    private val discoveredDevices = mutableListOf<BluetoothDevice>()

    // Add this function to show a toast message
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    // Polling interval (in milliseconds)
    private val pollingInterval = 3000L // 3 seconds

    @JavascriptInterface
    fun connectToDevice(address: String) {
        Log.d("BluetoothInterface", "Attempting to connect to $address")

        if (!hasBluetoothPermissions()) {
            Log.e("BluetoothInterface", "Bluetooth permissions are not granted")
            return
        }

        try {
            val device: BluetoothDevice = bluetoothAdapter?.getRemoteDevice(address)
                ?: throw IllegalArgumentException("Device not found or Bluetooth is disabled")
            val uuid: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

            bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid)
            bluetoothSocket?.connect()
            outputStream = bluetoothSocket?.outputStream

            if (bluetoothSocket?.isConnected == true) {
                Log.d("BluetoothInterface", "Connected to $address")
                startPollingConnectionStatus()
                context.runOnUiThread {
                    context.updateStatusBarColor(Color.parseColor("#4CBB17"))
                }
            }
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Connection failed", e)
            context.runOnUiThread {
                context.updateStatusBarColor(Color.RED)
            }
        }
    }

    @JavascriptInterface
    fun startDeviceDiscovery() {
        Log.d("BluetoothInterface", "Starting device discovery")

        if (!hasBluetoothPermissions()) {
            Log.e("BluetoothInterface", "Bluetooth permissions are not granted")
            return
        }

        if (bluetoothAdapter?.isEnabled == false) {
            return
        }

        // Clear the previous list of discovered devices
        discoveredDevices.clear()

        // Start discovery and register a BroadcastReceiver in MainActivity
        if (bluetoothAdapter?.startDiscovery() == true) {
            Log.d("BluetoothInterface", "Bluetooth discovery started")
        } else {
            Log.e("BluetoothInterface", "Failed to start Bluetooth discovery")
        }
    }

    // Function to pass discovered devices to WebView
    fun sendDiscoveredDevicesToWebView() {
        val jsonArray = JSONArray()

        for (device in discoveredDevices) {
            val deviceName = device.name ?: "Unknown Device"

            // Check if the device name contains "Dynamic Drive" or "esp32"
            if (deviceName.contains("Dynamic Drive", ignoreCase = true) ||
                deviceName.contains("esp32", ignoreCase = true)) {

                val jsonObject = JSONObject()
                jsonObject.put("name", deviceName)
                jsonObject.put("address", device.address)
                jsonArray.put(jsonObject)
            }
        }


        val jsonString = jsonArray.toString()

        context.runOnUiThread {
            Log.e("BluetoothInterface", "'$jsonString'")
            myWebView.evaluateJavascript("handleDiscoveredDevices('$jsonString')", null)
        }
    }

    fun addDiscoveredDevice(device: BluetoothDevice) {
        discoveredDevices.add(device)
        sendDiscoveredDevicesToWebView()
    }

    private fun startPollingConnectionStatus() {
        handler.postDelayed(object : Runnable {
            override fun run() {
                if (bluetoothSocket?.isConnected == false) {
                    Log.d("BluetoothInterface", "Connection lost")
                    context.runOnUiThread {
                        context.updateStatusBarColor(Color.RED)
                    }
                }
                handler.postDelayed(this, pollingInterval)
            }
        }, pollingInterval)
    }

    @JavascriptInterface
    fun receiveData(callback: String) {
        // Simulate receiving data or handle actual Bluetooth data reception
        val responseData = "Received data from ESP32"  // Replace with actual data from ESP32

        // Pass the data back to the WebView/JavaScript
        context.runOnUiThread {
            myWebView.evaluateJavascript("$callback('$responseData')", null)
        }
    }

    @JavascriptInterface
    fun sendKeyValuePair(data: String) {
        Log.d("BluetoothInterface", "Sending key value pair: $data")

        // Send data to ESP32 and wait for the response (this part you likely have working already)
        if (bluetoothSocket == null || !bluetoothSocket!!.isConnected) {
            Log.e("BluetoothInterface", "Cannot send data: Bluetooth is disconnected")
            return
        }

        try {
            outputStream?.write(data.toByteArray())
            // Add logic here to receive the response from ESP32, e.g., readInput()
                val responseData = readInput() // Method to read response from ESP32

            // Send response data to the WebView/JavaScript
            context.runOnUiThread {
                myWebView.evaluateJavascript("onBluetoothInterface_valueReturnedFromSendKeyValuePair('$responseData')", null)
            }

        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Failed to send data", e)
        }
    }

    // Simulate a method to read incoming data (modify as per your logic)
    private fun readInput(): String {
        // Example response data from ESP32
        Log.d("Debug", "readInput() called")

        return "{\"rideHeightFL\":91,\"rideHeightFR\":89,\"rideHeightRL\":90,\"rideHeightRR\":90,\"smoothingFactor\":0.8,\"speed\":0.8,\"minRideHeight\":5,\"maxRideHeight\":180}"
    }

    @JavascriptInterface
    fun disconnect() {
        Log.d("BluetoothInterface", "Disconnecting")

        try {
            bluetoothSocket?.close()
            context.runOnUiThread {
                context.updateStatusBarColor(Color.RED)
            }
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Failed to disconnect", e)
        }
    }

    @JavascriptInterface
    fun isConnected(): Boolean {
        return bluetoothSocket?.isConnected == true
    }

    private fun hasBluetoothPermissions(): Boolean {
        val permissions = arrayOf(
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN
        )

        for (permission in permissions) {
            if (ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return true
    }
}
