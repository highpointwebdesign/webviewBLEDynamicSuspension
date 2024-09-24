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
    private val pollingInterval = 3000L

    // Toast Utility
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    // Connection to Bluetooth device
    @JavascriptInterface
    fun connectToDevice(address: String) {
        Log.d("BluetoothInterface", "Connecting to $address")
        if (!hasBluetoothPermissions()) {
            Log.e("BluetoothInterface", "Bluetooth permissions are not granted")
            return
        }

        try {
            val device: BluetoothDevice = bluetoothAdapter?.getRemoteDevice(address)
                ?: throw IllegalArgumentException("Device not found or Bluetooth is disabled")

            bluetoothSocket = device.createRfcommSocketToServiceRecord(UUID.fromString("00001101-0000-1000-8000-00805F9B34FB"))
            bluetoothSocket?.connect()
            outputStream = bluetoothSocket?.outputStream

            if (bluetoothSocket?.isConnected == true) {
                Log.d("BluetoothInterface", "Connected to $address")
                updateStatusBar(Color.parseColor("#4CBB17"))
                //  startPollingConnectionStatus()
            }

        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Connection failed", e)
            updateStatusBar(Color.RED)
        }
    }

    // Device discovery
    @JavascriptInterface
    fun startDeviceDiscovery() {
        Log.d("BluetoothInterface", "Starting device discovery")
        if (!hasBluetoothPermissions() || bluetoothAdapter?.isEnabled == false) return

        discoveredDevices.clear()
        if (bluetoothAdapter?.startDiscovery() == true) {
            Log.d("BluetoothInterface", "Bluetooth discovery started")
        } else {
            Log.e("BluetoothInterface", "Failed to start Bluetooth discovery")
        }
    }

    // Add discovered device and send to WebView
    fun addDiscoveredDevice(device: BluetoothDevice) {
        discoveredDevices.add(device)
        sendDiscoveredDevicesToWebView()
    }

    private fun sendDiscoveredDevicesToWebView() {
        val jsonArray = JSONArray()
        discoveredDevices.forEach { device ->
            val deviceName = device.name ?: "Unknown Device"
            if (deviceName.contains("Dynamic Drive", ignoreCase = true) ||
                deviceName.contains("esp32", ignoreCase = true)) {

                jsonArray.put(JSONObject().apply {
                    put("name", deviceName)
                    put("address", device.address)
                })
            }
        }

        val jsonString = jsonArray.toString()
        context.runOnUiThread {
            Log.d("BluetoothInterface", "Sending devices: $jsonString")
            myWebView.evaluateJavascript("handleDiscoveredDevices('$jsonString')", null)
        }
    }

    // Save preferences to ESP32
    @JavascriptInterface
    fun savePreferencesToESP32(data: String) {
        Log.d("BluetoothInterface", "Saving data to ESP32: $data")
        if (isBluetoothConnected()) {
            try {
                outputStream?.write(data.toByteArray())
                requestPreferencesFromESP32()  // Call to update preferences
            } catch (e: IOException) {
                Log.e("BluetoothInterface", "Failed to save preferences", e)
            }
        }
    }

    @JavascriptInterface
    fun requestPreferencesFromESP32() {
        Log.d("BluetoothInterface", "123 Requesting preferences from ESP32")
        if (isBluetoothConnected()) {
            try {
                val requestData = "{\"getPreferences\": true}"
                outputStream?.let {
                    it.write(requestData.toByteArray())
                    it.flush()  // Flush to ensure all data is sent
                    Log.d("BluetoothInterface", "130 Data flushed to outputStream")
                }

                val responseData = readInput()
                context.runOnUiThread {
                    val trimmedResponseData = responseData.trim()
                    Log.d("BluetoothInterface", "Sending trimmed data back to webview:")
                    Log.d("BluetoothInterface", "$trimmedResponseData")
                    myWebView.evaluateJavascript("onBluetoothDataReceived('$trimmedResponseData')", null)
                    Log.d("BluetoothInterface", "Sent trimmed data back to webview onBluetoothDataReceived")
                }

//                context.runOnUiThread {
//                    Log.d("BluetoothInterface", "135 Sending data back to webview:")
//                    Log.d("BluetoothInterface", "136 $responseData")
//                    myWebView.evaluateJavascript("onBluetoothDataReceived('$responseData')", null)
//                    Log.d("BluetoothInterface", "138 Sent data back to webview onBluetoothDataReceived")
//                }
            } catch (e: IOException) {
                Log.e("BluetoothInterface", "Failed to request preferences", e)
            }
        }
    }

    private fun readInput(): String {
        val inputStream = bluetoothSocket?.inputStream
        val buffer = ByteArray(1024)
        return try {
            val bytes = inputStream?.read(buffer) ?: 0
            val rawData = String(buffer, 0, bytes)
            Log.d("BluetoothInterface", "166 Raw data received: $rawData")
            rawData
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "169 Error reading input from ESP32", e)
            "error"
        }
    }


    // Disconnect from Bluetooth
    @JavascriptInterface
    fun disconnect() {
        Log.d("BluetoothInterface", "Disconnecting")
        try {
            bluetoothSocket?.close()
            updateStatusBar(Color.RED)
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Failed to disconnect", e)
        }
    }

    @JavascriptInterface
    fun isConnected(): Boolean {
        return bluetoothSocket?.isConnected == true
    }

    // Poll connection status
//    private fun startPollingConnectionStatus() {
//        handler.postDelayed(object : Runnable {
//            override fun run() {
//                if (!isConnected()) updateStatusBar(Color.RED)
//                handler.postDelayed(this, pollingInterval)
//            }
//        }, pollingInterval)
//    }

    // Check for Bluetooth permissions
    private fun hasBluetoothPermissions(): Boolean {
        val permissions = arrayOf(
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN
        )
        return permissions.all { permission ->
            ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    // Helper to check if Bluetooth is connected
    private fun isBluetoothConnected(): Boolean {
        return bluetoothSocket?.isConnected == true
    }

    // Helper to update status bar color
    private fun updateStatusBar(color: Int) {
        context.runOnUiThread {
            context.updateStatusBarColor(color)
        }
    }
}
