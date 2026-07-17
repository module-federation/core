import XCTest

final class OrbitControlUITests: XCTestCase {
  private func launchNetworkBundle(
    environmentKey: String,
    fallback: String
  ) -> XCUIApplication {
    addUIInterruptionMonitor(withDescription: "Local network permission") { alert in
      guard alert.buttons["Allow"].exists else { return false }
      alert.buttons["Allow"].tap()
      return true
    }

    let app = XCUIApplication()
    app.launchEnvironment["LYNX_BUNDLE_URL"] =
      ProcessInfo.processInfo.environment[environmentKey] ?? fallback
    app.launch()
    app.tap()
    return app
  }

  private func attachScreenshot(named name: String) {
    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.name = name
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  func testEmbeddedReleaseHostLaunches() {
    let app = XCUIApplication()
    app.launchEnvironment["LYNX_BUNDLE_URL"] = ""
    app.launch()

    let loadButton = app.descendants(matching: .any)
      .matching(NSPredicate(format: "label == %@", "Load remote catalog"))
      .firstMatch
    XCTAssertTrue(loadButton.waitForExistence(timeout: 30))
  }

  func testFederatedImportsRuntimeLoadingAndSingleton() {
    let app = launchNetworkBundle(
      environmentKey: "LYNX_BUNDLE_URL",
      fallback: "http://localhost:3000/host-native/main.lynx.bundle"
    )

    let loadButton = app.descendants(matching: .any)
      .matching(NSPredicate(format: "label == %@", "Load remote catalog"))
      .firstMatch
    XCTAssertTrue(loadButton.waitForExistence(timeout: 30))
    loadButton.tap()

    let readiness = app.descendants(matching: .any)
      .matching(identifier: "federation-ready")
      .firstMatch
    let isReady = readiness.waitForExistence(timeout: 60)
    let error = app.descendants(matching: .any)
      .matching(identifier: "federation-error")
      .firstMatch
    let failure = error.exists ? error.label : "No federation error was rendered."
    XCTAssertTrue(isReady, failure)

    attachScreenshot(named: "Orbit Control federation loaded")
  }

  func testStandaloneCatalogRemoteBuildLaunches() {
    let app = launchNetworkBundle(
      environmentKey: "CATALOG_BUNDLE_URL",
      fallback: "http://localhost:3000/catalog-native/main.lynx.bundle"
    )

    let readiness = app.descendants(matching: .any)
      .matching(identifier: "catalog-standalone-ready")
      .firstMatch
    XCTAssertTrue(readiness.waitForExistence(timeout: 30))

    for label in ["REMOTE CARD", "REMOTE DETAILS", "Federated activity"] {
      let component = app.descendants(matching: .any)
        .matching(NSPredicate(format: "label == %@", label))
        .firstMatch
      XCTAssertTrue(component.waitForExistence(timeout: 30), "Missing \(label)")
    }

    let count = app.descendants(matching: .any)
      .matching(identifier: "shared-card-count")
      .firstMatch
    XCTAssertTrue(count.waitForExistence(timeout: 30))
    let baseline = count.label

    let increment = app.descendants(matching: .any)
      .matching(NSPredicate(format: "label == %@", "Increment from remote"))
      .firstMatch
    XCTAssertTrue(increment.waitForExistence(timeout: 30))
    increment.tap()
    expectation(
      for: NSPredicate(format: "label != %@", baseline),
      evaluatedWith: count
    )
    waitForExpectations(timeout: 10)

    attachScreenshot(named: "Standalone Orbit Catalog")
  }
}
