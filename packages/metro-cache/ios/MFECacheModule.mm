#import "MFECacheModule.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <CommonCrypto/CommonDigest.h>
#import <jsi/jsi.h>

using namespace facebook;

@implementation MFECacheModule {
  BOOL _jsiInstalled;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(MFECache)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark - JSI Installation

/// Called by RN when the bridge is set. We use this to install JSI host functions.
- (void)setBridge:(RCTBridge *)bridge {
  _bridge = bridge;
  _jsiInstalled = NO;
  [self installJSIBindingsIfNeeded];
}

- (void)installJSIBindingsIfNeeded {
  if (_jsiInstalled) return;

  RCTCxxBridge *cxxBridge = (RCTCxxBridge *)self.bridge;
  if (!cxxBridge || !cxxBridge.runtime) {
    // Runtime not ready yet, retry on next runloop tick
    __weak auto weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
      [weakSelf installJSIBindingsIfNeeded];
    });
    return;
  }

  auto &runtime = *reinterpret_cast<jsi::Runtime *>(cxxBridge.runtime);
  [self installReadFileSync:runtime];
  _jsiInstalled = YES;
}

/// Install global.__MFE_readFileSync(filePath) — synchronous JSI function.
/// Reads file from disk and returns content as a JS string, all on the JS thread.
- (void)installReadFileSync:(jsi::Runtime &)runtime {
  auto readFileSync = jsi::Function::createFromHostFunction(
    runtime,
    jsi::PropNameID::forAscii(runtime, "__MFE_readFileSync"),
    1, // 1 argument: filePath
    [](jsi::Runtime &rt,
       const jsi::Value &thisVal,
       const jsi::Value *args,
       size_t count) -> jsi::Value {

      if (count < 1 || !args[0].isString()) {
        throw jsi::JSError(rt, "__MFE_readFileSync: expected (filePath: string)");
      }

      std::string filePath = args[0].asString(rt).utf8(rt);

      // Synchronous file read on JS thread
      NSString *nsPath = [NSString stringWithUTF8String:filePath.c_str()];
      NSData *data = [NSData dataWithContentsOfFile:nsPath];
      if (!data) {
        throw jsi::JSError(rt, std::string("__MFE_readFileSync: file not found: ") + filePath);
      }

      // Return file content as JS string
      auto content = std::string(reinterpret_cast<const char *>(data.bytes), data.length);
      return jsi::String::createFromUtf8(rt, content);
    }
  );

  runtime.global().setProperty(runtime, "__MFE_readFileSync", std::move(readFileSync));
}

- (void)invalidate {
  _jsiInstalled = NO;
}

#pragma mark - File System Operations (async bridge methods — unchanged)

RCT_EXPORT_METHOD(writeFile:(NSString *)path
                  content:(NSString *)content
                  encoding:(NSString *)encoding
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *data;
      if ([encoding isEqualToString:@"base64"]) {
        data = [[NSData alloc] initWithBase64EncodedString:content options:0];
      } else {
        data = [content dataUsingEncoding:NSUTF8StringEncoding];
      }

      NSString *dir = [path stringByDeletingLastPathComponent];
      NSFileManager *fm = [NSFileManager defaultManager];
      if (![fm fileExistsAtPath:dir]) {
        [fm createDirectoryAtPath:dir withIntermediateDirectories:YES attributes:nil error:nil];
      }

      [data writeToFile:path atomically:YES];
      resolve(nil);
    } @catch (NSException *exception) {
      reject(@"WRITE_ERROR", exception.reason, nil);
    }
  });
}

RCT_EXPORT_METHOD(readFile:(NSString *)path
                  encoding:(NSString *)encoding
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSData *data = [NSData dataWithContentsOfFile:path];
    if (!data) {
      reject(@"READ_ERROR", [NSString stringWithFormat:@"File not found: %@", path], nil);
      return;
    }
    if ([encoding isEqualToString:@"base64"]) {
      resolve([data base64EncodedStringWithOptions:0]);
    } else {
      resolve([[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
    }
  });
}

RCT_EXPORT_METHOD(deleteFile:(NSString *)path
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSError *error;
    [[NSFileManager defaultManager] removeItemAtPath:path error:&error];
    if (error) {
      reject(@"DELETE_ERROR", error.localizedDescription, error);
    } else {
      resolve(nil);
    }
  });
}

RCT_EXPORT_METHOD(fileExists:(NSString *)path
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  BOOL exists = [[NSFileManager defaultManager] fileExistsAtPath:path];
  resolve(@(exists));
}

RCT_EXPORT_METHOD(getDocumentDirectory:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  resolve(paths.firstObject);
}

#pragma mark - SHA-256

- (NSString *)sha256FromData:(NSData *)data {
  unsigned char hash[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(data.bytes, (CC_LONG)data.length, hash);
  NSMutableString *hex = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
  for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
    [hex appendFormat:@"%02x", hash[i]];
  }
  return hex;
}

RCT_EXPORT_METHOD(sha256File:(NSString *)filePath
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSData *data = [NSData dataWithContentsOfFile:filePath];
    if (!data) {
      reject(@"SHA256_ERROR", [NSString stringWithFormat:@"File not found: %@", filePath], nil);
      return;
    }
    resolve([self sha256FromData:data]);
  });
}

RCT_EXPORT_METHOD(sha256String:(NSString *)content
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSData *data = [content dataUsingEncoding:NSUTF8StringEncoding];
  resolve([self sha256FromData:data]);
}

#pragma mark - Download with streaming SHA-256

RCT_EXPORT_METHOD(downloadFile:(NSString *)urlString
                  destPath:(NSString *)destPath
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSURL *url = [NSURL URLWithString:urlString];
      NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
      [request setHTTPMethod:@"GET"];
      [request setTimeoutInterval:60];

      __block NSError *sessionError = nil;
      dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);

      NSURLSessionDataTask *task = [[NSURLSession sharedSession]
        dataTaskWithRequest:request
        completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
          if (error) {
            sessionError = error;
            dispatch_semaphore_signal(semaphore);
            return;
          }

          NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
          if (httpResponse.statusCode != 200) {
            sessionError = [NSError errorWithDomain:@"MFECache"
                                               code:httpResponse.statusCode
                                           userInfo:@{NSLocalizedDescriptionKey:
                                             [NSString stringWithFormat:@"HTTP %ld", (long)httpResponse.statusCode]}];
            dispatch_semaphore_signal(semaphore);
            return;
          }

          NSString *dir = [destPath stringByDeletingLastPathComponent];
          NSFileManager *fm = [NSFileManager defaultManager];
          if (![fm fileExistsAtPath:dir]) {
            [fm createDirectoryAtPath:dir withIntermediateDirectories:YES attributes:nil error:nil];
          }

          [data writeToFile:destPath atomically:YES];

          unsigned char hash[CC_SHA256_DIGEST_LENGTH];
          CC_SHA256(data.bytes, (CC_LONG)data.length, hash);
          NSMutableString *hex = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
          for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
            [hex appendFormat:@"%02x", hash[i]];
          }

          resolve(@{
            @"sha256": hex,
            @"bytesWritten": @(data.length)
          });
          dispatch_semaphore_signal(semaphore);
        }];

      [task resume];
      dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);

      if (sessionError) {
        reject(@"DOWNLOAD_ERROR", sessionError.localizedDescription, sessionError);
      }
    } @catch (NSException *exception) {
      reject(@"DOWNLOAD_ERROR", exception.reason, nil);
    }
  });
}

@end
