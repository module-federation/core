// Derived from official Lynx iOS resource fetcher examples (Apache-2.0).

#import "OrbitResourceFetcher.h"

#import <Lynx/LynxBooleanOption.h>
#import <Lynx/LynxTemplateResource.h>
#import <Lynx/LynxViewBuilder.h>

static NSString *const OrbitResourceErrorDomain = @"org.modulefederation.lynx.resources";

@interface OrbitResourceFetcher ()

- (dispatch_block_t)loadDataForURLString:(NSString *)urlString
                              completion:(void (^)(NSData *_Nullable,
                                                   NSError *_Nullable))completion;
- (NSURL *_Nullable)localURLForString:(NSString *)urlString;
- (NSError *)errorWithMessage:(NSString *)message;

@end

@implementation OrbitResourceFetcher

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

  return [self loadDataForURLString:request.url
                         completion:^(NSData *data, NSError *error) {
                           if (!data) {
                             callback(nil, error);
                             return;
                           }

                           NSURL *directory = [NSURL fileURLWithPath:NSTemporaryDirectory()
                                                         isDirectory:YES];
                           directory = [directory URLByAppendingPathComponent:@"OrbitResources"
                                                                   isDirectory:YES];
                           NSError *writeError = nil;
                           [[NSFileManager defaultManager] createDirectoryAtURL:directory
                                                   withIntermediateDirectories:YES
                                                                    attributes:nil
                                                                         error:&writeError];
                           NSURL *fileURL = [directory URLByAppendingPathComponent:
                             [NSUUID UUID].UUIDString];
                           if (!writeError && [data writeToURL:fileURL options:NSDataWritingAtomic
                                                        error:&writeError]) {
                             callback(fileURL.path, nil);
                           } else {
                             callback(nil, writeError);
                           }
                         }];
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

  NSURLSessionDataTask *task = [[NSURLSession sharedSession]
    dataTaskWithURL:url
  completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
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

    if (!data) {
      completion(nil, [self errorWithMessage:[NSString stringWithFormat:
        @"Lynx resource request returned no data: %@", urlString]]);
      return;
    }
    completion(data, nil);
  }];
  [task resume];
  return ^{ [task cancel]; };
}

- (NSURL *_Nullable)localURLForString:(NSString *)urlString {
  NSURL *url = [NSURL URLWithString:urlString];
  if ([url.scheme isEqualToString:@"file"]) {
    return url;
  }
  if ([url.scheme isEqualToString:@"http"] ||
      [url.scheme isEqualToString:@"https"]) {
    return nil;
  }
  if ([urlString isAbsolutePath]) {
    return [NSURL fileURLWithPath:urlString];
  }

  NSString *filename = urlString.lastPathComponent;
  NSString *extension = filename.pathExtension;
  NSString *name = extension.length > 0
    ? [filename stringByDeletingPathExtension]
    : filename;
  return [[NSBundle mainBundle] URLForResource:name
                                  withExtension:extension.length > 0 ? extension : nil];
}

- (NSError *)errorWithMessage:(NSString *)message {
  return [NSError errorWithDomain:OrbitResourceErrorDomain
                             code:1
                         userInfo:@{NSLocalizedDescriptionKey: message}];
}

@end
