// Derived from the official Lynx HelloLynxSwift starter (Apache-2.0).

import UIKit

final class ViewController: UIViewController {
  private let resourceFetcher = OrbitResourceFetcher()
  private var lynxView: LynxView?

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .black

    let lynxView = LynxView { builder in
      builder.config = LynxConfig(provider: self.resourceFetcher)
      builder.screenSize = self.view.bounds.size
      builder.fontScale = 1.0
      self.resourceFetcher.configure(builder)
    }

    lynxView.frame = view.bounds
    lynxView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    lynxView.preferredLayoutWidth = view.bounds.width
    lynxView.preferredLayoutHeight = view.bounds.height
    lynxView.layoutWidthMode = .exact
    lynxView.layoutHeightMode = .exact
    view.addSubview(lynxView)
    self.lynxView = lynxView

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(enterForeground),
      name: UIApplication.willEnterForegroundNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(enterBackground),
      name: UIApplication.didEnterBackgroundNotification,
      object: nil
    )

    lynxView.loadTemplate(fromURL: rootBundleURL, initData: nil)
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    lynxView?.preferredLayoutWidth = view.bounds.width
    lynxView?.preferredLayoutHeight = view.bounds.height
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    lynxView?.clearForDestroy()
  }

  @objc private func enterForeground() {
    lynxView?.onEnterForeground()
  }

  @objc private func enterBackground() {
    lynxView?.onEnterBackground()
  }

  private var rootBundleURL: String {
    if let override = ProcessInfo.processInfo.environment["LYNX_BUNDLE_URL"],
       !override.isEmpty {
      return override
    }
#if DEBUG
    return "http://localhost:3000/main.lynx.bundle"
#else
    return "main.lynx.bundle"
#endif
  }
}
