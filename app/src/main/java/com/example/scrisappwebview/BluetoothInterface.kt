package com.example.scrisappwebview

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Color
import android.util.Log
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import java.io.IOException
import java.io.OutputStream
import java.util.UUID
import android.os.Handler
import android.os.Looper

class BluetoothInterface(private val context: MainActivity) {
    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null
    private val handler = Handler(Looper.getMainLooper())

    // Polling interval (in milliseconds)
    private val pollingInterval = 3000L // 3 seconds

    @JavascriptInterface
    fun connectToDevice(address: String) {
        Log.d("BluetoothInterface", "Attempting to connect to $address")

        // Check for Bluetooth permissions
        if (!hasBluetoothPermissions()) {
            Log.e("BluetoothInterface", "Bluetooth permissions are not granted")
            return
        }

        try {
            val device: BluetoothDevice = bluetoothAdapter?.getRemoteDevice(address)
                ?: throw IllegalArgumentException("Device not found or Bluetooth is disabled")
            val uuid: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") // Standard SPP UUID

            bluetoothSocket = device.createRfcommSocketToServiceRecord(uuid)
            bluetoothSocket?.connect()
            outputStream = bluetoothSocket?.outputStream

            if (bluetoothSocket?.isConnected == true) {
                Log.d("BluetoothInterface", "Connected to $address")
                // Change status bar color to Azure Blue on connection
                startPollingConnectionStatus()
                context.runOnUiThread {
                    context.updateStatusBarColor(Color.parseColor("#007FFF")) // Azure Blue
                }
            }
        } catch (e: SecurityException) {
            Log.e("BluetoothInterface", "Bluetooth permission denied", e)
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Connection failed", e)
            // Change status bar color to Red on failure
            context.runOnUiThread {
                context.updateStatusBarColor(Color.RED)
            }
        } catch (e: IllegalArgumentException) {
            Log.e("BluetoothInterface", "Invalid Bluetooth device address", e)
        }
    }

    private fun startPollingConnectionStatus() {
        handler.postDelayed(object : Runnable {
            override fun run() {
                if (bluetoothSocket?.isConnected == false) {
                    // Connection lost
                    Log.d("BluetoothInterface", "Connection lost")
                    context.runOnUiThread {
                        context.updateStatusBarColor(Color.RED) // Set status bar to red on disconnection
                    }
                }
                // Continue polling
                handler.postDelayed(this, pollingInterval)
            }
        }, pollingInterval)
    }

    @JavascriptInterface
    fun sendData(data: String) {
        Log.d("BluetoothInterface", "Sending data: $data")
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
