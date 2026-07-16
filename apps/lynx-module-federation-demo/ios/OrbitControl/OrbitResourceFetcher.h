// Derived from official Lynx iOS resource fetcher examples (Apache-2.0).

#import <Foundation/Foundation.h>
#import <Lynx/LynxGenericResourceFetcher.h>
#import <Lynx/LynxTemplateProvider.h>
#import <Lynx/LynxTemplateResourceFetcher.h>

@class LynxViewBuilder;

NS_ASSUME_NONNULL_BEGIN

@interface OrbitResourceFetcher : NSObject <LynxTemplateProvider,
                                             LynxTemplateResourceFetcher,
                                             LynxGenericResourceFetcher>

- (void)configureBuilder:(LynxViewBuilder *)builder NS_SWIFT_NAME(configure(_:));

@end

NS_ASSUME_NONNULL_END
