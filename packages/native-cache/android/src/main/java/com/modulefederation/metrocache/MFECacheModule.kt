package com.modulefederation.metrocache

import com.facebook.react.bridge.*
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

class MFECacheModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    init {
      System.loadLibrary("mfecache")
    }
  }

  private external fun nativeInstallJSI(runtimePtr: Long)

  override fun getName(): String = "MFECache"

  // Called from JS: NativeMFECache.installJSI() — synchronous.
  // At this point runtime is guaranteed ready (JS is already running).
  @ReactMethod(isBlockingSynchronousMethod = true)
  fun installJSI(): Boolean {
    return try {
      val jsContext = reactApplicationContext.javaScriptContextHolder?.get() ?: 0L
      if (jsContext != 0L) {
        nativeInstallJSI(jsContext)
        true
      } else {
        false
      }
    } catch (e: Exception) {
      false
    }
  }

  private val httpClient = OkHttpClient.Builder()
    .connectTimeout(60, TimeUnit.SECONDS)
    .readTimeout(60, TimeUnit.SECONDS)
    .build()

  // --- File System Operations ---

  @ReactMethod
  fun writeFile(path: String, content: String, encoding: String, promise: Promise) {
    Thread {
      try {
        val file = File(path)
        file.parentFile?.mkdirs()
        if (encoding == "base64") {
          val bytes = android.util.Base64.decode(content, android.util.Base64.DEFAULT)
          file.writeBytes(bytes)
        } else {
          file.writeText(content, Charsets.UTF_8)
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("WRITE_ERROR", e.message, e)
      }
    }.start()
  }

  @ReactMethod
  fun readFile(path: String, encoding: String, promise: Promise) {
    Thread {
      try {
        val file = File(path)
        if (!file.exists()) {
          promise.reject("READ_ERROR", "File not found: $path")
          return@Thread
        }
        if (encoding == "base64") {
          val bytes = file.readBytes()
          promise.resolve(android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP))
        } else {
          promise.resolve(file.readText(Charsets.UTF_8))
        }
      } catch (e: Exception) {
        promise.reject("READ_ERROR", e.message, e)
      }
    }.start()
  }

  @ReactMethod
  fun deleteFile(path: String, promise: Promise) {
    Thread {
      try {
        val file = File(path)
        if (file.exists()) {
          file.deleteRecursively()
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("DELETE_ERROR", e.message, e)
      }
    }.start()
  }

  @ReactMethod
  fun fileExists(path: String, promise: Promise) {
    promise.resolve(File(path).exists())
  }

  @ReactMethod
  fun getDocumentDirectory(promise: Promise) {
    promise.resolve(reactApplicationContext.filesDir.absolutePath)
  }

  @ReactMethod
  fun getFileSize(path: String, promise: Promise) {
    Thread {
      try {
        val file = File(path)
        if (!file.exists()) {
          promise.reject("FILE_SIZE_ERROR", "File not found: $path")
          return@Thread
        }
        promise.resolve(file.length().toDouble())
      } catch (e: Exception) {
        promise.reject("FILE_SIZE_ERROR", e.message, e)
      }
    }.start()
  }

  // --- SHA-256 ---

  private fun sha256Hex(bytes: ByteArray): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val hash = digest.digest(bytes)
    return hash.joinToString("") { "%02x".format(it) }
  }

  @ReactMethod
  fun sha256File(filePath: String, promise: Promise) {
    Thread {
      try {
        val file = File(filePath)
        if (!file.exists()) {
          promise.reject("SHA256_ERROR", "File not found: $filePath")
          return@Thread
        }
        promise.resolve(sha256Hex(file.readBytes()))
      } catch (e: Exception) {
        promise.reject("SHA256_ERROR", e.message, e)
      }
    }.start()
  }

  @ReactMethod
  fun sha256String(content: String, promise: Promise) {
    promise.resolve(sha256Hex(content.toByteArray(Charsets.UTF_8)))
  }

  // --- Download with SHA-256 ---

  @ReactMethod
  fun downloadFile(url: String, destPath: String, promise: Promise) {
    Thread {
      try {
        val request = Request.Builder().url(url).get().build()
        val response = httpClient.newCall(request).execute()

        if (!response.isSuccessful) {
          promise.reject("DOWNLOAD_ERROR", "HTTP ${response.code}")
          response.close()
          return@Thread
        }

        val body = response.body ?: run {
          promise.reject("DOWNLOAD_ERROR", "Empty response body")
          response.close()
          return@Thread
        }

        val destFile = File(destPath)
        destFile.parentFile?.mkdirs()

        val digest = MessageDigest.getInstance("SHA-256")
        var bytesWritten = 0L

        body.byteStream().use { input ->
          FileOutputStream(destFile).use { output ->
            val buffer = ByteArray(8192)
            var read: Int
            while (input.read(buffer).also { read = it } != -1) {
              output.write(buffer, 0, read)
              digest.update(buffer, 0, read)
              bytesWritten += read
            }
          }
        }

        val sha256 = digest.digest().joinToString("") { "%02x".format(it) }

        val result = Arguments.createMap().apply {
          putString("sha256", sha256)
          putDouble("bytesWritten", bytesWritten.toDouble())
        }
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("DOWNLOAD_ERROR", e.message, e)
      }
    }.start()
  }

}
