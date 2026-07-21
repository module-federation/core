#import <XCTest/XCTest.h>

#import "../OrbitControl/OrbitResourceDownloader.h"
#import "../OrbitControl/OrbitResourceStore.h"
#import "../OrbitControl/OrbitResourceURLResolver.h"

@interface OrbitResourceDownloader (Testing)
- (void)URLSession:(NSURLSession *)session
      downloadTask:(NSURLSessionDownloadTask *)downloadTask
      didWriteData:(int64_t)bytesWritten
 totalBytesWritten:(int64_t)totalBytesWritten
totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite;
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
  NSURL *outsideFile = [outside URLByAppendingPathComponent:@"secret.bundle"];
  XCTAssertTrue([[@"secret" dataUsingEncoding:NSUTF8StringEncoding]
    writeToURL:outsideFile
    atomically:YES]);
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
  OrbitResourceDownloader *downloader = [[OrbitResourceDownloader alloc] init];
  NSURLSession *session = [NSURLSession sessionWithConfiguration:
    NSURLSessionConfiguration.ephemeralSessionConfiguration];
  NSURLSessionDownloadTask *task = [session
    downloadTaskWithURL:[NSURL URLWithString:@"https://oversize.test/chunk.bundle"]];

  [downloader URLSession:session
            downloadTask:task
            didWriteData:1
       totalBytesWritten:1
  totalBytesExpectedToWrite:(int64_t)OrbitResourceDownloadByteLimit + 1];

  XCTAssertEqual(task.state, NSURLSessionTaskStateCanceling);
  [session invalidateAndCancel];
}

@end
