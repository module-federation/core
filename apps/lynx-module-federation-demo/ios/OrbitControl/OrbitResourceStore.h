#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT NSUInteger const OrbitResourceStoreByteLimit;

@interface OrbitResourceStore : NSObject

@property(nonatomic, strong, readonly) NSURL *cacheDirectoryURL;

- (instancetype)init;
- (instancetype)initWithCacheDirectoryURL:(NSURL *)cacheDirectoryURL
  NS_DESIGNATED_INITIALIZER;
- (nullable NSString *)pathForURLString:(NSString *)urlString;
- (nullable NSString *)storeData:(NSData *)data
                     forURLString:(NSString *)urlString
                            error:(NSError **)error;

@end

NS_ASSUME_NONNULL_END
