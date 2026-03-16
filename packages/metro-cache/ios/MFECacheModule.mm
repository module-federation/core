#import "MFECacheModule.h"
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>
#import <CommonCrypto/CommonDigest.h>
#import <jsi/jsi.h>

@implementation MFECacheModule

RCT_EXPORT_MODULE(MFECache)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

#pragma mark - File System Operations

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

          // Ensure destination directory exists
          NSString *dir = [destPath stringByDeletingLastPathComponent];
          NSFileManager *fm = [NSFileManager defaultManager];
          if (![fm fileExistsAtPath:dir]) {
            [fm createDirectoryAtPath:dir withIntermediateDirectories:YES attributes:nil error:nil];
          }

          // Write to disk
          [data writeToFile:destPath atomically:YES];

          // Compute SHA-256
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

#pragma mark - JavaScript Evaluation via JSI

RCT_EXPORT_METHOD(evaluateJavaScript:(NSString *)filePath
                  sourceURL:(NSString *)sourceURL
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      NSData *data = [NSData dataWithContentsOfFile:filePath];
      if (!data) {
        reject(@"EVAL_ERROR", [NSString stringWithFormat:@"File not found: %@", filePath], nil);
        return;
      }

      NSString *script = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
      if (!script) {
        reject(@"EVAL_ERROR", @"Failed to read file as UTF-8", nil);
        return;
      }

      // Execute on JS thread via RCTBridge
      RCTBridge *bridge = [RCTBridge currentBridge];
      if (!bridge) {
        reject(@"EVAL_ERROR", @"RCTBridge is not available", nil);
        return;
      }

      RCTCxxBridge *cxxBridge = (RCTCxxBridge *)bridge;
      if (!cxxBridge.runtime) {
        reject(@"EVAL_ERROR", @"JSI runtime is not available", nil);
        return;
      }

      // Use original bundle URL as sourceURL so Metro's module resolution works correctly
      NSString *evalSourceURL = (sourceURL && sourceURL.length > 0) ? sourceURL : filePath;

      // Must evaluate on JS thread
      [bridge dispatchBlock:^{
        @try {
          auto &runtime = *reinterpret_cast<facebook::jsi::Runtime *>(cxxBridge.runtime);
          auto jsScript = std::make_shared<facebook::jsi::StringBuffer>([script UTF8String]);
          runtime.evaluateJavaScript(jsScript, [evalSourceURL UTF8String]);

          // Resolve immediately on JS thread — synchronous eval is critical
          // for correct wrapper chain ordering in asyncRequire.ts
          resolve(nil);
        } @catch (NSException *exception) {
          reject(@"EVAL_ERROR", exception.reason, nil);
        }
      } queue:RCTJSThread];
    } @catch (NSException *exception) {
      reject(@"EVAL_ERROR", exception.reason, nil);
    }
  });
}

@end
