#import <XCTest/XCTest.h>

#import "../OrbitControl/OrbitResourceDownloader.h"
#import "../OrbitControl/OrbitResourceStore.h"
#import "../OrbitControl/OrbitResourceURLResolver.h"

static BOOL OrbitOversizeProtocolStopped = NO;

@interface OrbitOversizeProtocol : NSURLProtocol
@end

@implementation OrbitOversizeProtocol

+ (BOOL)canInitWithRequest:(NSURLRequest *)request {
  return [request.URL.host isEqualToString:@"oversize.test"];
}

+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request {
  return request;
}

- (void)startLoading {
  NSDictionary *headers = @{
    @"Content-Length": [NSString stringWithFormat:@"%llu",
      (unsigned long long)OrbitResourceDownloadByteLimit + 1]
  };
  NSHTTPURLResponse *response = [[NSHTTPURLResponse alloc]
    initWithURL:self.request.URL
    statusCode:200
    HTTPVersion:@"HTTP/1.1"
    headerFields:headers];
  [self.client URLProtocol:self
        didReceiveResponse:response
        cacheStoragePolicy:NSURLCacheStorageNotAllowed];
  [self.client URLProtocol:self didLoadData:[@"x" dataUsingEncoding:NSUTF8StringEncoding]];
}

- (void)stopLoading {
  OrbitOversizeProtocolStopped = YES;
}

@end

@interface OrbitResourceTests : XCTestCase
@end

@implementation OrbitResourceTests

- (void)testResolvesRootRelativeLoopbackURLs {
  OrbitResourceURLResolver *resolver = [[OrbitResourceURLResolver alloc]
    initWithRootBundleURL:@"http://127.0.0.1:3000/host-native/main.lynx.bundle"];

  NSURL *resolved = [resolver resolvedURLForString:@"/static/js/async/shared.js"];

  XCTAssertEqualObjects(resolved.absoluteString,
                        @"http://127.0.0.1:3000/static/js/async/shared.js");
}

- (void)testRejectsTraversalAndSymlinkEscapes {
  NSFileManager *files = NSFileManager.defaultManager;
  NSURL *parent = [[NSURL fileURLWithPath:NSTemporaryDirectory() isDirectory:YES]
    URLByAppendingPathComponent:NSUUID.UUID.UUIDString
    isDirectory:YES];
  NSURL *root = [parent URLByAppendingPathComponent:@"root" isDirectory:YES];
  NSURL *outside = [parent URLByAppendingPathComponent:@"outside" isDirectory:YES];
  XCTAssertTrue([files createDirectoryAtURL:root
                withIntermediateDirectories:YES
                                 attributes:nil
                                      error:nil]);
  XCTAssertTrue([files createDirectoryAtURL:outside
                withIntermediateDirectories:YES
                                 attributes:nil
                                      error:nil]);
  NSURL *insideFile = [root URLByAppendingPathComponent:@"inside.bundle"];
  XCTAssertTrue([[@"inside" dataUsingEncoding:NSUTF8StringEncoding]
    writeToURL:insideFile
    atomically:YES]);
  NSURL *escape = [root URLByAppendingPathComponent:@"escape"];
  XCTAssertTrue([files createSymbolicLinkAtURL:escape
                          withDestinationURL:outside
                                       error:nil]);
  OrbitResourceURLResolver *resolver = [[OrbitResourceURLResolver alloc]
    initWithRootBundleURL:@""
    allowedLocalDirectories:@[root]];

  XCTAssertTrue([resolver isAllowedLocalURL:insideFile]);
  XCTAssertFalse([resolver isAllowedLocalURL:
    [escape URLByAppendingPathComponent:@"secret.bundle"]]);
  XCTAssertNil([resolver resolvedURLForString:@"../secret.bundle"]);
  XCTAssertNil([resolver resolvedURLForString:@"/static/../secret.bundle"]);
  [files removeItemAtURL:parent error:nil];
}

- (void)testReplacesCachedDataWithinLimitAndCleansUp {
  NSFileManager *files = NSFileManager.defaultManager;
  NSURL *directory = [[NSURL fileURLWithPath:NSTemporaryDirectory()
                                isDirectory:YES]
    URLByAppendingPathComponent:NSUUID.UUID.UUIDString
    isDirectory:YES];
  @autoreleasepool {
    OrbitResourceStore *store = [[OrbitResourceStore alloc]
      initWithCacheDirectoryURL:directory];
    NSError *error = nil;
    NSString *first = [store storeData:[@"first" dataUsingEncoding:NSUTF8StringEncoding]
                          forURLString:@"https://example.test/chunk.bundle"
                                 error:&error];
    XCTAssertNotNil(first);
    XCTAssertNil(error);

    NSString *replacement = [store
      storeData:[@"replacement" dataUsingEncoding:NSUTF8StringEncoding]
      forURLString:@"https://example.test/chunk.bundle"
      error:&error];
    XCTAssertNotEqualObjects(first, replacement);
    XCTAssertFalse([files fileExistsAtPath:first]);
    XCTAssertEqualObjects([NSData dataWithContentsOfFile:replacement],
                          [@"replacement" dataUsingEncoding:NSUTF8StringEncoding]);

    NSData *oversized = [NSMutableData dataWithLength:OrbitResourceStoreByteLimit + 1];
    XCTAssertNil([store storeData:oversized
                     forURLString:@"https://example.test/too-large.bundle"
                            error:&error]);
    XCTAssertEqualObjects(error.localizedDescription,
                          @"Lynx resource path cache exceeded 64 MiB");
  }
  XCTAssertFalse([files fileExistsAtPath:directory.path]);
}

- (void)testCancelsOversizedDownloads {
  OrbitOversizeProtocolStopped = NO;
  NSURLSessionConfiguration *configuration =
    NSURLSessionConfiguration.ephemeralSessionConfiguration;
  configuration.protocolClasses = @[[OrbitOversizeProtocol class]];
  OrbitResourceDownloader *downloader = [[OrbitResourceDownloader alloc]
    initWithSessionConfiguration:configuration];
  XCTestExpectation *completed = [self expectationWithDescription:@"download completed"];

  [downloader downloadURL:[NSURL URLWithString:@"https://oversize.test/chunk.bundle"]
                completion:^(NSData *data, NSURLResponse *response, NSError *error) {
    (void)response;
    XCTAssertNil(data);
    XCTAssertTrue([error.localizedDescription containsString:@"exceeds 64 MiB"]);
    [completed fulfill];
  }];

  [self waitForExpectationsWithTimeout:2 handler:nil];
  XCTAssertTrue(OrbitOversizeProtocolStopped);
}

@end
