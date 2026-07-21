#import "OrbitResourceURLResolver.h"

@interface OrbitResourceURLResolver ()

@property(nonatomic, copy) NSArray<NSURL *> *allowedLocalDirectories;
@property(nonatomic, strong, nullable) NSURL *rootBundleURL;

@end


@implementation OrbitResourceURLResolver

- (instancetype)initWithRootBundleURL:(NSString *)rootBundleURL {
  return [self initWithRootBundleURL:rootBundleURL
             allowedLocalDirectories:@[NSBundle.mainBundle.bundleURL]];
}

- (instancetype)initWithRootBundleURL:(NSString *)rootBundleURL
               allowedLocalDirectories:(NSArray<NSURL *> *)directories {
  self = [super init];
  if (self) {
    NSURL *rootURL = [NSURL URLWithString:rootBundleURL];
    if ([rootURL.scheme isEqualToString:@"http"] ||
        [rootURL.scheme isEqualToString:@"https"]) {
      _rootBundleURL = rootURL;
    }
    _allowedLocalDirectories = [directories copy];
  }
  return self;
}

- (nullable NSURL *)resolvedURLForString:(NSString *)urlString {
  NSURL *url = [NSURL URLWithString:urlString];
  NSString *unresolvedPath = url.path.length > 0 ? url.path : urlString;
  if ([unresolvedPath.pathComponents containsObject:@".."]) return nil;

  if (self.rootBundleURL && [urlString hasPrefix:@"/static/"]) {
    return [NSURL URLWithString:urlString relativeToURL:self.rootBundleURL].absoluteURL;
  }

  if ([url.scheme isEqualToString:@"http"] ||
      [url.scheme isEqualToString:@"https"]) {
    return url;
  }
  if ([url.scheme isEqualToString:@"file"]) {
    return [self isAllowedLocalURL:url] ? url : nil;
  }

  NSString *relativePath;
  if (urlString.isAbsolutePath) {
    NSURL *fileURL = [NSURL fileURLWithPath:urlString];
    if ([self isAllowedLocalURL:fileURL]) return fileURL;
    if (![urlString hasPrefix:@"/static/"]) return nil;
    relativePath = [urlString substringFromIndex:1];
  } else {
    relativePath = unresolvedPath;
  }

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
    ? filename.stringByDeletingPathExtension
    : filename;
  return [NSBundle.mainBundle URLForResource:name
                               withExtension:extension.length > 0 ? extension : nil
                                subdirectory:[subdirectory isEqualToString:@"."]
                                  ? nil
                                  : subdirectory];
}

- (BOOL)isAllowedLocalURL:(NSURL *)url {
  if (!url.isFileURL) return NO;
  NSString *resolvedPath =
    url.URLByStandardizingPath.URLByResolvingSymlinksInPath.path;
  for (NSURL *directory in self.allowedLocalDirectories) {
    NSString *directoryPath =
      directory.URLByStandardizingPath.URLByResolvingSymlinksInPath.path;
    if ([resolvedPath isEqualToString:directoryPath] ||
        [resolvedPath hasPrefix:[directoryPath stringByAppendingString:@"/"]]) {
      return YES;
    }
  }
  return NO;
}

@end
