#import "OrbitResourceDownloader.h"

NSUInteger const OrbitResourceDownloadByteLimit = 64 * 1024 * 1024;

static NSString *const OrbitResourceDownloadErrorDomain =
  @"org.modulefederation.lynx.resources";

@interface OrbitResourceDownloader () <NSURLSessionDownloadDelegate>

@property(nonatomic, strong) NSMutableDictionary<NSNumber *, id> *completions;
@property(nonatomic, strong) NSMutableSet<NSNumber *> *oversizedTasks;
@property(nonatomic, strong) NSURLSession *session;

@end

@implementation OrbitResourceDownloader

- (instancetype)init {
  NSURLSessionConfiguration *configuration =
    NSURLSessionConfiguration.ephemeralSessionConfiguration;
  configuration.timeoutIntervalForRequest = 30;
  configuration.timeoutIntervalForResource = 60;
  configuration.requestCachePolicy = NSURLRequestReloadIgnoringLocalCacheData;
  return [self initWithSessionConfiguration:configuration];
}

- (instancetype)initWithSessionConfiguration:(NSURLSessionConfiguration *)configuration {
  self = [super init];
  if (self) {
    _completions = [NSMutableDictionary dictionary];
    _oversizedTasks = [NSMutableSet set];
    _session = [NSURLSession sessionWithConfiguration:configuration
                                             delegate:self
                                        delegateQueue:nil];
  }
  return self;
}

- (void)dealloc {
  [self.session invalidateAndCancel];
}

- (dispatch_block_t)downloadURL:(NSURL *)url
                     completion:(OrbitResourceDownloadCompletion)completion {
  NSURLSessionDownloadTask *task = [self.session downloadTaskWithURL:url];
  @synchronized(self) {
    self.completions[@(task.taskIdentifier)] = [completion copy];
  }
  [task resume];
  return ^{ [task cancel]; };
}

- (OrbitResourceDownloadCompletion)takeCompletionForTask:(NSURLSessionTask *)task {
  @synchronized(self) {
    NSNumber *key = @(task.taskIdentifier);
    OrbitResourceDownloadCompletion completion = self.completions[key];
    [self.completions removeObjectForKey:key];
    return completion;
  }
}

- (NSError *)errorForURL:(NSURL *)url prefix:(NSString *)prefix {
  return [NSError errorWithDomain:OrbitResourceDownloadErrorDomain
                             code:1
                         userInfo:@{
                           NSLocalizedDescriptionKey:
                             [NSString stringWithFormat:@"%@: %@",
                                                        prefix,
                                                        url.absoluteString]
                         }];
}

- (BOOL)takeOversizedFlagForTask:(NSURLSessionTask *)task {
  @synchronized(self) {
    NSNumber *key = @(task.taskIdentifier);
    BOOL oversized = [self.oversizedTasks containsObject:key];
    [self.oversizedTasks removeObject:key];
    return oversized;
  }
}

- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
      didWriteData:(int64_t)bytesWritten
 totalBytesWritten:(int64_t)totalBytesWritten
totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite {
  (void)session;
  (void)bytesWritten;
  if (totalBytesWritten > (int64_t)OrbitResourceDownloadByteLimit ||
      totalBytesExpectedToWrite > (int64_t)OrbitResourceDownloadByteLimit) {
    @synchronized(self) {
      [self.oversizedTasks addObject:@(downloadTask.taskIdentifier)];
    }
    [downloadTask cancel];
  }
}

- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
didFinishDownloadingToURL:(NSURL *)location {
  (void)session;
  BOOL oversized = [self takeOversizedFlagForTask:downloadTask];
  OrbitResourceDownloadCompletion completion =
    [self takeCompletionForTask:downloadTask];
  if (!completion) {
    [NSFileManager.defaultManager removeItemAtURL:location error:nil];
    return;
  }

  NSError *resultError = nil;
  NSData *data = nil;
  NSURLResponse *response = downloadTask.response;
  if (oversized) {
    resultError = [self errorForURL:downloadTask.originalRequest.URL
                             prefix:@"Lynx resource exceeds 64 MiB"];
  }
  if (!resultError && [response isKindOfClass:NSHTTPURLResponse.class]) {
    NSInteger statusCode = ((NSHTTPURLResponse *)response).statusCode;
    if (statusCode < 200 || statusCode >= 300) {
      resultError = [NSError errorWithDomain:OrbitResourceDownloadErrorDomain
                                        code:1
                                    userInfo:@{
                                      NSLocalizedDescriptionKey:
                                        [NSString stringWithFormat:
                                          @"Lynx resource request failed with HTTP %ld: %@",
                                          (long)statusCode,
                                          downloadTask.originalRequest.URL.absoluteString]
                                    }];
    }
  }

  NSNumber *fileSize = nil;
  if (!resultError &&
      ![location getResourceValue:&fileSize
                           forKey:NSURLFileSizeKey
                            error:&resultError]) {
    fileSize = nil;
  }
  if (!resultError &&
      (response.expectedContentLength > (long long)OrbitResourceDownloadByteLimit ||
       fileSize.unsignedLongLongValue > OrbitResourceDownloadByteLimit)) {
    resultError = [self errorForURL:downloadTask.originalRequest.URL
                             prefix:@"Lynx resource exceeds 64 MiB"];
  }
  if (!resultError) {
    data = [NSData dataWithContentsOfURL:location
                                 options:NSDataReadingMappedIfSafe
                                   error:&resultError];
    if (!data && !resultError) {
      resultError = [self errorForURL:downloadTask.originalRequest.URL
                               prefix:@"Lynx resource request returned no data"];
    }
  }
  [NSFileManager.defaultManager removeItemAtURL:location error:nil];
  completion(data, response, resultError);
}

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didCompleteWithError:(NSError *)error {
  (void)session;
  if (!error) return;

  BOOL oversized = [self takeOversizedFlagForTask:task];
  OrbitResourceDownloadCompletion completion = [self takeCompletionForTask:task];
  if (!completion) return;
  completion(nil,
             task.response,
             oversized
               ? [self errorForURL:task.originalRequest.URL
                            prefix:@"Lynx resource exceeds 64 MiB"]
               : error);
}

@end
