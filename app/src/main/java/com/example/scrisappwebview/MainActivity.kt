package com.example.scrisappwebview

import android.os.Bundle
import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import android.graphics.Color
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.widget.Toast

class MainActivity : AppCompatActivity() {
    private lateinit var bluetoothAdapter: BluetoothAdapter
    private lateinit var bluetoothInterface: BluetoothInterface // Save the BluetoothInterface instance
    private val devicesList = mutableListOf<BluetoothDevice>()

    // Declare myWebView at the class level
    private lateinit var myWebView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize WebView
        myWebView = findViewById(R.id.webview) // Initialize here
        val webSettings: WebSettings = myWebView.settings
        webSettings.javaScriptEnabled = true
        myWebView.webViewClient = WebViewClient()

        // Initialize BluetoothInterface and attach it to WebView
        bluetoothInterface = BluetoothInterface(this, myWebView)
        myWebView.addJavascriptInterface(bluetoothInterface, "BluetoothInterface")

        // Load the HTML file
        myWebView.loadUrl("file:///android_asset/index.html")

        // Check and request Bluetooth permissions
        val permissions = arrayOf(
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN
        )

        if (!hasPermissions(permissions)) {
            ActivityCompat.requestPermissions(this, permissions, 1)
        }

        // Initialize Bluetooth adapter
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()

        // Register for broadcasts when a device is discovered
        val filter = IntentFilter(BluetoothDevice.ACTION_FOUND)
        registerReceiver(receiver, filter)
    }

    // Function to update the status bar color
    fun updateStatusBarColor(color: Int) {
        window.statusBarColor = color
    }

    // Helper function to check permissions
    private fun hasPermissions(permissions: Array<String>): Boolean {
        for (permission in permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return true
    }

    // Start scanning for Bluetooth devices
    fun startBluetoothScan() {
        bluetoothAdapter.startDiscovery()
    }

    // BroadcastReceiver for discovered devices
    private val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                BluetoothDevice.ACTION_FOUND -> {
                    val device: BluetoothDevice? =
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    device?.let {
                        // Add the device to the BluetoothInterface to pass it to the WebView
                        bluetoothInterface.addDiscoveredDevice(it) // Use the instance of BluetoothInterface
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(receiver)
    }

    override fun onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack() // Go back to the previous page
        } else {
            super.onBackPressed() // Exit the app if there's no page to go back to
        }
    }
}
