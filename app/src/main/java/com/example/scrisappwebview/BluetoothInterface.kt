package com.example.scrisappwebview

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.pm.PackageManager
import android.content.Context
import android.graphics.Color
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
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
                    context.updateStatusBarColor(Color.parseColor("#007FFF"))
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
            val jsonObject = JSONObject()
            jsonObject.put("name", device.name ?: "Unknown Device")
            jsonObject.put("address", device.address)
            jsonArray.put(jsonObject)
        }

        val jsonString = jsonArray.toString()

        context.runOnUiThread {
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
    fun sendData(data: String) {
        Log.d("BluetoothInterface", "Sending data: $data")

        if (bluetoothSocket == null || !bluetoothSocket!!.isConnected) {
            Log.e("BluetoothInterface", "Cannot send data: Bluetooth is disconnected")
            return
        }

        try {
            outputStream?.write(data.toByteArray())
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Failed to send data", e)
        }
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
