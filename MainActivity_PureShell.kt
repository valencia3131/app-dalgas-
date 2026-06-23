package com.ttdownloader.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

/**
 * TTDownloader PURE SHELL (Saf Kabuk) Mimarisi
 * Bu uygulama sadece bir penceredir. Tüm içerik ve mantık Netlify'dan gelir.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val REMOTE_URL = "https://stalwart-travesseiro-253213.netlify.app/"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Dinamik WebView oluşturma (Layout dosyasına bağımlılığı azaltır)
        webView = WebView(this)
        setContentView(webView)

        setupWebView()
    }

    private fun setupWebView() {
        val settings = webView.settings
        
        // En kritik ayarlar: JavaScript ve Depolama
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        
        // Performans ve Uyumluluk Ayarları
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.javaScriptCanOpenWindowsAutomatically = true

        // Sayfaların uygulama içinde kalmasını sağlayan istemci
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // Sadece senin sitende kalmasını sağlar, dış linkleri engeller (opsiyonel)
                return false 
            }
        }

        // Beyni (Netlify) Yükle
        webView.loadUrl(REMOTE_URL)
    }

    // Cihazın geri tuşuna basıldığında WebView'da geri git
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
