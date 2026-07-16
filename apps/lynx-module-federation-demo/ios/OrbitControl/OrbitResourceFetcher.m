// Derived from official Lynx iOS resource fetcher examples (Apache-2.0).

#import "OrbitResourceFetcher.h"

#import <Lynx/LynxBooleanOption.h>
#import <Lynx/LynxTemplateResource.h>
#import <Lynx/LynxViewBuilder.h>

static NSString *const OrbitResourceErrorDomain = @"org.modulefederation.lynx.resources";
static NSUInteger const OrbitResourcePathCacheByteLimit = 64 * 1024 * 1024;
static NSUInteger const OrbitResourceResponseByteLimit = 64 * 1024 * 1024;

typedef void (^OrbitResourceDownloadCompletion)(NSURL *_Nullable,
                                                NSURLResponse *_Nullable,
                                                NSError *_Nullable);

@interface OrbitResourceSessionDelegate : NSObject <NSURLSessionDownloadDelegate>

@property(nonatomic, strong) NSMutableDictionary<NSNumber *, id> *completions;

- (NSURLSessionDownloadTask *)downloadURL:(NSURL *)url
                                  session:(NSURLSession *)session
                               completion:(OrbitResourceDownloadCompletion)completion;

@end

@implementation OrbitResourceSessionDelegate

- (instancetype)init {
  self = [super init];
  if (self) {
    _completions = [NSMutableDictionary dictionary];
  }
  return self;
}

- (NSURLSessionDownloadTask *)downloadURL:(NSURL *)url
                                  session:(NSURLSession *)session
                               completion:(OrbitResourceDownloadCompletion)completion {
  NSURLSessionDownloadTask *task = [session downloadTaskWithURL:url];
  @synchronized(self) {
    self.completions[@(task.taskIdentifier)] = [completion copy];
  }
  [task resume];
  return task;
}

- (OrbitResourceDownloadCompletion)takeCompletionForTask:(NSURLSessionTask *)task {
  @synchronized(self) {
    NSNumber *key = @(task.taskIdentifier);
    OrbitResourceDownloadCompletion completion = self.completions[key];
    [self.completions removeObjectForKey:key];
    return completion;
  }
}

- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
      didWriteData:(int64_t)bytesWritten
 totalBytesWritten:(int64_t)totalBytesWritten
totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite {
  (void)session;
  (void)bytesWritten;
  if (totalBytesWritten > (int64_t)OrbitResourceResponseByteLimit ||
      totalBytesExpectedToWrite > (int64_t)OrbitResourceResponseByteLimit) {
    [downloadTask cancel];
  }
}

- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
didFinishDownloadingToURL:(NSURL *)location {
  OrbitResourceDownloadCompletion completion =
    [self takeCompletionForTask:downloadTask];
  if (completion) {
    completion(location, downloadTask.response, nil);
  }
}

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didCompleteWithError:(NSError *)error {
  (void)session;
  if (!error) return;
  OrbitResourceDownloadCompletion completion = [self takeCompletionForTask:task];
  if (completion) {
    completion(nil, task.response, error);
  }
}

@end

@interface OrbitResourceFetcher ()

@property(nonatomic, strong) NSMutableDictionary<NSString *, NSString *> *resourcePathCache;
@property(nonatomic, strong) NSURL *resourceCacheDirectory;
@property(nonatomic, assign) NSUInteger resourcePathCacheBytes;
@property(nonatomic, strong) NSURLSession *session;
@property(nonatomic, strong) OrbitResourceSessionDelegate *sessionDelegate;

- (dispatch_block_t)loadDataForURLString:(NSString *)urlString
                              completion:(void (^)(NSData *_Nullable,
                                                   NSError *_Nullable))completion;
- (NSURL *_Nullable)localURLForString:(NSString *)urlString;
- (BOOL)isAllowedLocalURL:(NSURL *)url;
- (NSString *_Nullable)cachedResourcePathForURLString:(NSString *)urlString;
- (NSString *_Nullable)storeResourceData:(NSData *)data
                             forURLString:(NSString *)urlString
                                    error:(NSError **)error;
- (NSError *)errorWithMessage:(NSString *)message;

@end

@implementation OrbitResourceFetcher

- (instancetype)init {
  self = [super init];
  if (self) {
    _resourcePathCache = [NSMutableDictionary dictionary];
    NSURLSessionConfiguration *sessionConfiguration =
      [NSURLSessionConfiguration ephemeralSessionConfiguration];
    sessionConfiguration.timeoutIntervalForRequest = 30;
    sessionConfiguration.timeoutIntervalForResource = 60;
    sessionConfiguration.requestCachePolicy = NSURLRequestReloadIgnoringLocalCacheData;
    _sessionDelegate = [[OrbitResourceSessionDelegate alloc] init];
    _session = [NSURLSession sessionWithConfiguration:sessionConfiguration
                                             delegate:_sessionDelegate
                                        delegateQueue:nil];
    _resourceCacheDirectory = [[[NSURL fileURLWithPath:NSTemporaryDirectory()
                                           isDirectory:YES]
      URLByAppendingPathComponent:@"OrbitResources"
                       isDirectory:YES]
      URLByAppendingPathComponent:NSUUID.UUID.UUIDString
                       isDirectory:YES];
  }
  return self;
}

- (void)dealloc {
  [self.session invalidateAndCancel];
  [[NSFileManager defaultManager] removeItemAtURL:self.resourceCacheDirectory error:nil];
}

- (void)configureBuilder:(LynxViewBuilder *)builder {
  builder.enableGenericResourceFetcher = LynxBooleanOptionTrue;
  builder.genericResourceFetcher = self;
  builder.templateResourceFetcher = self;
}

- (void)loadTemplateWithUrl:(NSString *)url
                 onComplete:(LynxTemplateLoadBlock)callback {
  [self loadDataForURLString:url
                  completion:^(NSData *data, NSError *error) {
                    callback(data, error);
                  }];
}

- (void)fetchTemplate:(LynxResourceRequest *)request
           onComplete:(LynxTemplateResourceCompletionBlock)callback {
  [self loadDataForURLString:request.url
                  completion:^(NSData *data, NSError *error) {
                    callback(data ? [[LynxTemplateResource alloc] initWithNSData:data] : nil,
                             error);
                  }];
}

- (void)fetchSSRData:(LynxResourceRequest *)request
          onComplete:(LynxSSRResourceCompletionBlock)callback {
  [self loadDataForURLString:request.url completion:callback];
}

- (dispatch_block_t)fetchResource:(LynxResourceRequest *)request
                       onComplete:(LynxGenericResourceCompletionBlock)callback {
  return [self loadDataForURLString:request.url completion:callback];
}

- (dispatch_block_t)fetchResourcePath:(LynxResourceRequest *)request
                           onComplete:(LynxGenericResourcePathCompletionBlock)callback {
  NSURL *localURL = [self localURLForString:request.url];
  if (localURL) {
    callback(localURL.path, nil);
    return ^{};
  }

  NSString *cachedPath = [self cachedResourcePathForURLString:request.url];
  if (cachedPath) {
    callback(cachedPath, nil);
    return ^{};
  }

  return [self loadDataForURLString:request.url
                         completion:^(NSData *data, NSError *error) {
                           if (!data) {
                             callback(nil, error);
                             return;
                           }

                           NSError *writeError = nil;
                           NSString *path = [self storeResourceData:data
                                                       forURLString:request.url
                                                              error:&writeError];
                           callback(path, writeError);
                         }];
}

- (NSString *_Nullable)cachedResourcePathForURLString:(NSString *)urlString {
  @synchronized(self) {
    return self.resourcePathCache[urlString];
  }
}

- (NSString *_Nullable)storeResourceData:(NSData *)data
                             forURLString:(NSString *)urlString
                                    error:(NSError **)error {
  @synchronized(self) {
    NSString *existingPath = self.resourcePathCache[urlString];
    if (existingPath) return existingPath;
    if (data.length >
        OrbitResourcePathCacheByteLimit - self.resourcePathCacheBytes) {
      *error = [self errorWithMessage:@"Lynx resource path cache exceeded 64 MiB"];
      return nil;
    }

    [[NSFileManager defaultManager] createDirectoryAtURL:self.resourceCacheDirectory
                              withIntermediateDirectories:YES
                                               attributes:nil
                                                    error:error];
    if (*error) return nil;

    NSString *extension = [NSURL URLWithString:urlString].pathExtension;
    NSString *filename = NSUUID.UUID.UUIDString;
    if (extension.length > 0) {
      filename = [filename stringByAppendingPathExtension:extension];
    }
    NSURL *fileURL = [self.resourceCacheDirectory URLByAppendingPathComponent:filename];
    if (![data writeToURL:fileURL options:NSDataWritingAtomic error:error]) return nil;

    self.resourcePathCache[urlString] = fileURL.path;
    self.resourcePathCacheBytes += data.length;
    return fileURL.path;
  }
}

- (dispatch_block_t)loadDataForURLString:(NSString *)urlString
                              completion:(void (^)(NSData *_Nullable,
                                                   NSError *_Nullable))completion {
  NSURL *localURL = [self localURLForString:urlString];
  if (localURL) {
    NSError *error = nil;
    NSData *data = [NSData dataWithContentsOfURL:localURL options:0 error:&error];
    completion(data, error);
    return ^{};
  }

  NSURL *url = [NSURL URLWithString:urlString];
  if (!url || !([url.scheme isEqualToString:@"http"] ||
                [url.scheme isEqualToString:@"https"])) {
    completion(nil, [self errorWithMessage:[NSString stringWithFormat:
      @"Unsupported Lynx resource URL: %@", urlString]]);
    return ^{};
  }

  NSURLSessionDownloadTask *task = [self.sessionDelegate
    downloadURL:url
         session:self.session
      completion:^(NSURL *location, NSURLResponse *response, NSError *error) {
    if (error) {
      completion(nil, error);
      return;
    }

    if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
      NSInteger statusCode = ((NSHTTPURLResponse *)response).statusCode;
      if (statusCode < 200 || statusCode >= 300) {
        completion(nil, [self errorWithMessage:[NSString stringWithFormat:
          @"Lynx resource request failed with HTTP %ld: %@",
          (long)statusCode, urlString]]);
        return;
      }
    }

    long long expectedLength = response.expectedContentLength;
    if (expectedLength > (long long)OrbitResourceResponseByteLimit) {
      completion(nil, [self errorWithMessage:[NSString stringWithFormat:
        @"Lynx resource exceeds 64 MiB: %@", urlString]]);
      return;
    }

    if (!location) {
      completion(nil, [self errorWithMessage:[NSString stringWithFormat:
        @"Lynx resource request returned no data: %@", urlString]]);
      return;
    }

    NSError *readError = nil;
    NSNumber *fileSize = nil;
    if (![location getResourceValue:&fileSize
                             forKey:NSURLFileSizeKey
                              error:&readError]) {
      completion(nil, readError);
      return;
    }
    if (fileSize.unsignedLongLongValue > OrbitResourceResponseByteLimit) {
      completion(nil, [self errorWithMessage:[NSString stringWithFormat:
        @"Lynx resource exceeds 64 MiB: %@", urlString]]);
      return;
    }

    NSData *data = [NSData dataWithContentsOfURL:location
                                         options:NSDataReadingMappedIfSafe
                                           error:&readError];
    if (!data) {
      completion(nil, readError ?: [self errorWithMessage:[NSString stringWithFormat:
        @"Lynx resource request returned no data: %@", urlString]]);
      return;
    }
    completion(data, nil);
  }];
  return ^{ [task cancel]; };
}

- (NSURL *_Nullable)localURLForString:(NSString *)urlString {
  NSURL *url = [NSURL URLWithString:urlString];
  if ([url.scheme isEqualToString:@"file"]) {
    return [self isAllowedLocalURL:url] ? url : nil;
  }
  if ([url.scheme isEqualToString:@"http"] ||
      [url.scheme isEqualToString:@"https"]) {
    return nil;
  }
  if ([urlString isAbsolutePath]) {
    NSURL *fileURL = [NSURL fileURLWithPath:urlString];
    return [self isAllowedLocalURL:fileURL] ? fileURL : nil;
  }

  NSString *relativePath = url.path.length > 0 ? url.path : urlString;
  relativePath = relativePath.stringByStandardizingPath;
  if (relativePath.length == 0 || [relativePath isEqualToString:@"."] ||
      [relativePath isEqualToString:@".."] ||
      [relativePath hasPrefix:@"../"]) {
    return nil;
  }
  NSString *filename = relativePath.lastPathComponent;
  NSString *subdirectory = relativePath.stringByDeletingLastPathComponent;
  NSString *extension = filename.pathExtension;
  NSString *name = extension.length > 0
    ? [filename stringByDeletingPathExtension]
    : filename;
  return [[NSBundle mainBundle] URLForResource:name
                                  withExtension:extension.length > 0 ? extension : nil
                                   subdirectory:[subdirectory isEqualToString:@"."]
                                     ? nil
                                     : subdirectory];
}

- (BOOL)isAllowedLocalURL:(NSURL *)url {
  NSString *path = url.URLByStandardizingPath.URLByResolvingSymlinksInPath.path;
  for (NSURL *directory in @[[NSBundle mainBundle].bundleURL,
                             self.resourceCacheDirectory]) {
    NSString *directoryPath =
      directory.URLByStandardizingPath.URLByResolvingSymlinksInPath.path;
    NSString *prefix = [directoryPath stringByAppendingString:@"/"];
    if ([path hasPrefix:prefix]) return YES;
  }
  return NO;
}

- (NSError *)errorWithMessage:(NSString *)message {
  return [NSError errorWithDomain:OrbitResourceErrorDomain
                             code:1
                         userInfo:@{NSLocalizedDescriptionKey: message}];
}

@end
