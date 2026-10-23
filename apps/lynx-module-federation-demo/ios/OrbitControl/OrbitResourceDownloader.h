#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT NSUInteger const OrbitResourceDownloadByteLimit;

typedef void (^OrbitResourceDownloadCompletion)(NSData *_Nullable,
                                                NSURLResponse *_Nullable,
                                                NSError *_Nullable);

@interface OrbitResourceDownloader : NSObject

- (instancetype)init;
- (instancetype)initWithSessionConfiguration:(NSURLSessionConfiguration *)configuration
  NS_DESIGNATED_INITIALIZER;
- (dispatch_block_t)downloadURL:(NSURL *)url
                     completion:(OrbitResourceDownloadCompletion)completion;

@end

NS_ASSUME_NONNULL_END
