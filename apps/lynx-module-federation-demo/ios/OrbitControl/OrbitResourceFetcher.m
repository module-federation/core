// Derived from official Lynx iOS resource fetcher examples (Apache-2.0).

#import "OrbitResourceFetcher.h"

#import "OrbitResourceDownloader.h"
#import "OrbitResourceStore.h"
#import "OrbitResourceURLResolver.h"

#import <Lynx/LynxBooleanOption.h>
#import <Lynx/LynxTemplateResource.h>
#import <Lynx/LynxViewBuilder.h>

static NSString *const OrbitResourceErrorDomain =
  @"org.modulefederation.lynx.resources";

@interface OrbitResourceFetcher ()

@property(nonatomic, strong) OrbitResourceDownloader *downloader;
@property(nonatomic, strong) OrbitResourceURLResolver *resolver;
@property(nonatomic, strong) OrbitResourceStore *store;

@end


@implementation OrbitResourceFetcher

- (instancetype)initWithRootBundleURL:(NSString *)rootBundleURL {
  self = [super init];
  if (self) {
    _downloader = [[OrbitResourceDownloader alloc] init];
    _resolver = [[OrbitResourceURLResolver alloc]
      initWithRootBundleURL:rootBundleURL];
    _store = [[OrbitResourceStore alloc] init];
  }
  return self;
}

- (NSError *)errorWithMessage:(NSString *)message {
  return [NSError errorWithDomain:OrbitResourceErrorDomain
                             code:1
                         userInfo:@{NSLocalizedDescriptionKey: message}];
}

- (dispatch_block_t)loadDataForURLString:(NSString *)urlString
                              completion:(void (^)(NSData *_Nullable,
                                                   NSError *_Nullable))completion {
  NSURL *url = [self.resolver resolvedURLForString:urlString];
  if (!url) {
    completion(nil, [self errorWithMessage:[NSString stringWithFormat:
      @"Unsupported Lynx resource URL: %@", urlString]]);
    return ^{};
  }

  if (url.isFileURL) {
    NSError *error = nil;
    NSData *data = [NSData dataWithContentsOfURL:url options:0 error:&error];
    completion(data, error);
    return ^{};
  }

  return [self.downloader
    downloadURL:url
    completion:^(NSData *data, NSURLResponse *response, NSError *error) {
      (void)response;
      completion(data, error);
    }];
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
                    callback(data
                               ? [[LynxTemplateResource alloc] initWithNSData:data]
                               : nil,
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
  NSURL *url = [self.resolver resolvedURLForString:request.url];
  if (!url) {
    callback(nil, [self errorWithMessage:[NSString stringWithFormat:
      @"Unsupported Lynx resource URL: %@", request.url]]);
    return ^{};
  }
  if (url.isFileURL) {
    callback(url.path, nil);
    return ^{};
  }

  NSString *urlString = url.absoluteString;
  NSString *cachedPath = [self.store pathForURLString:urlString];
  if (cachedPath) {
    callback(cachedPath, nil);
    return ^{};
  }

  return [self.downloader
    downloadURL:url
    completion:^(NSData *data, NSURLResponse *response, NSError *error) {
      (void)response;
      if (!data) {
        callback(nil, error);
        return;
      }

      NSError *writeError = nil;
      NSString *path = [self.store storeData:data
                                forURLString:urlString
                                       error:&writeError];
      callback(path, writeError);
    }];
}

@end
