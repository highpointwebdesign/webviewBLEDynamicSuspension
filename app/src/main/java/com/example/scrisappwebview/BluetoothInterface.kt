package com.example.scrisappwebview

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import java.io.IOException
import java.io.OutputStream
import java.util.UUID

class BluetoothInterface(private val context: Context) {
    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null

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
            }
        } catch (e: SecurityException) {
            Log.e("BluetoothInterface", "Bluetooth permission denied", e)
        } catch (e: IOException) {
            Log.e("BluetoothInterface", "Connection failed", e)
        } catch (e: IllegalArgumentException) {
            Log.e("BluetoothInterface", "Invalid Bluetooth device address", e)
        }
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
