#import "OrbitResourceStore.h"

NSUInteger const OrbitResourceStoreByteLimit = 64 * 1024 * 1024;

static NSString *const OrbitResourceStoreErrorDomain =
  @"org.modulefederation.lynx.resources";

@interface OrbitResourceStore ()

@property(nonatomic, strong, readwrite) NSURL *cacheDirectoryURL;
@property(nonatomic, strong) NSMutableDictionary<NSString *, NSString *> *paths;
@property(nonatomic, assign) NSUInteger storedBytes;

@end

@implementation OrbitResourceStore

- (instancetype)init {
  NSURL *directory = [[[NSURL fileURLWithPath:NSTemporaryDirectory()
                                   isDirectory:YES]
    URLByAppendingPathComponent:@"OrbitResources"
                     isDirectory:YES]
    URLByAppendingPathComponent:NSUUID.UUID.UUIDString
                     isDirectory:YES];
  return [self initWithCacheDirectoryURL:directory];
}

- (instancetype)initWithCacheDirectoryURL:(NSURL *)cacheDirectoryURL {
  self = [super init];
  if (self) {
    _cacheDirectoryURL = cacheDirectoryURL;
    _paths = [NSMutableDictionary dictionary];
  }
  return self;
}

- (void)dealloc {
  [NSFileManager.defaultManager removeItemAtURL:self.cacheDirectoryURL error:nil];
}

- (nullable NSString *)pathForURLString:(NSString *)urlString {
  @synchronized(self) {
    return self.paths[urlString];
  }
}

- (nullable NSString *)storeData:(NSData *)data
                     forURLString:(NSString *)urlString
                            error:(NSError **)error {
  @synchronized(self) {
    if (data.length > OrbitResourceStoreByteLimit - self.storedBytes) {
      if (error) {
        *error = [NSError errorWithDomain:OrbitResourceStoreErrorDomain
                                     code:1
                                 userInfo:@{
                                   NSLocalizedDescriptionKey:
                                     @"Lynx resource path cache exceeded 64 MiB"
                                 }];
      }
      return nil;
    }
    NSUInteger nextSize = self.storedBytes + data.length;

    NSError *writeError = nil;
    [NSFileManager.defaultManager
      createDirectoryAtURL:self.cacheDirectoryURL
      withIntermediateDirectories:YES
      attributes:nil
      error:&writeError];
    if (writeError) {
      if (error) *error = writeError;
      return nil;
    }

    NSString *extension = [NSURL URLWithString:urlString].pathExtension;
    NSString *filename = NSUUID.UUID.UUIDString;
    if (extension.length > 0) {
      filename = [filename stringByAppendingPathExtension:extension];
    }
    NSURL *fileURL = [self.cacheDirectoryURL
      URLByAppendingPathComponent:filename];
    if (![data writeToURL:fileURL options:NSDataWritingAtomic error:&writeError]) {
      if (error) *error = writeError;
      return nil;
    }

    // Lynx may still be reading an earlier path for this URL.
    self.paths[urlString] = fileURL.path;
    self.storedBytes = nextSize;
    return fileURL.path;
  }
}

@end
