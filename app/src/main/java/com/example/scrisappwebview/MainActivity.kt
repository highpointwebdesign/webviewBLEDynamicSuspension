package com.example.scrisappwebview

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.example.scrisappwebview.R.id

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Find the WebView in the layout
        val myWebView: WebView = findViewById(id.webview)

        // Enable JavaScript (if needed)
        val webSettings: WebSettings = myWebView.settings
        webSettings.javaScriptEnabled = true

        // Load the index.html from assets
        myWebView.loadUrl("file:///android_asset/index.html")

        // Ensure links open within the WebView instead of in a browser
        myWebView.webViewClient = WebViewClient()
    }
}
