package com.example.scrisappwebview

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.example.scrisappwebview.R.id
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val permissions = arrayOf(
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN
        )

        if (!hasPermissions(permissions)) {
            ActivityCompat.requestPermissions(this, permissions, 1)
        }

        val myWebView: WebView = findViewById(R.id.webview)
        val webSettings: WebSettings = myWebView.settings
        webSettings.javaScriptEnabled = true

        // Set WebViewClient to handle redirects within WebView
        myWebView.webViewClient = WebViewClient()

        // Add the JavaScript interface
        myWebView.addJavascriptInterface(BluetoothInterface(this), "BluetoothInterface")

        // Load the HTML file
        myWebView.loadUrl("file:///android_asset/index.html")
    }

    private fun hasPermissions(permissions: Array<String>): Boolean {
        for (permission in permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false
            }
        }
        return true
    }
}
