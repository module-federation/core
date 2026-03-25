#include <fbjni/fbjni.h>
#include <jsi/jsi.h>
#include <fstream>
#include <sstream>
#include <string>

using namespace facebook;

extern "C"
JNIEXPORT void JNICALL
Java_com_modulefederation_metrocache_MFECacheModule_nativeInstallJSI(
    JNIEnv *env,
    jobject /* this */,
    jlong runtimePtr) {

  auto &runtime = *reinterpret_cast<jsi::Runtime *>(runtimePtr);

  auto readFileSync = jsi::Function::createFromHostFunction(
    runtime,
    jsi::PropNameID::forAscii(runtime, "__MFE_readFileSync"),
    1, // filePath
    [](jsi::Runtime &rt,
       const jsi::Value &,
       const jsi::Value *args,
       size_t count) -> jsi::Value {

      if (count < 1 || !args[0].isString()) {
        throw jsi::JSError(rt, "__MFE_readFileSync: expected (filePath: string)");
      }

      std::string filePath = args[0].asString(rt).utf8(rt);

      // Synchronous file read
      std::ifstream file(filePath, std::ios::binary | std::ios::ate);
      if (!file.is_open()) {
        throw jsi::JSError(rt, std::string("__MFE_readFileSync: file not found: ") + filePath);
      }

      auto size = file.tellg();
      file.seekg(0, std::ios::beg);
      std::string content(size, '\0');
      file.read(&content[0], size);
      file.close();

      return jsi::String::createFromUtf8(rt, content);
    }
  );

  runtime.global().setProperty(runtime, "__MFE_readFileSync", std::move(readFileSync));
}
