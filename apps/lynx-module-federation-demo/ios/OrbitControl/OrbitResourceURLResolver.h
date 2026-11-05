#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface OrbitResourceURLResolver : NSObject

- (instancetype)initWithRootBundleURL:(NSString *)rootBundleURL;
- (instancetype)initWithRootBundleURL:(NSString *)rootBundleURL
               allowedLocalDirectories:(NSArray<NSURL *> *)directories
  NS_DESIGNATED_INITIALIZER;
- (instancetype)init NS_UNAVAILABLE;
- (nullable NSURL *)resolvedURLForString:(NSString *)urlString;
- (BOOL)isAllowedLocalURL:(NSURL *)url;

@end

NS_ASSUME_NONNULL_END
