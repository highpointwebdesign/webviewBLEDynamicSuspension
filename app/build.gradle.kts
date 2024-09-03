plugins {
    id("com.android.application") version "8.5.2"  // Update to match the classpath version
    id("org.jetbrains.kotlin.android") version "1.9.0"  // Ensure this matches the Kotlin version you're using
}

android {
    namespace = "com.example.scrisappwebview"
    compileSdk = 34  // Update this line to compileSdk 34

    defaultConfig {
        applicationId = "com.example.scrisappwebview"
        minSdk = 21
        targetSdk = 34  // Optionally, update this to match compileSdk
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}


dependencies {
    implementation("androidx.core:core-ktx:1.13.1")  // Replace with the actual version you want
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.9.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
