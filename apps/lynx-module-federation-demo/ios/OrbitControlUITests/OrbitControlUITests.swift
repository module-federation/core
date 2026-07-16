import XCTest

final class OrbitControlUITests: XCTestCase {
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
    addUIInterruptionMonitor(withDescription: "Local network permission") { alert in
      guard alert.buttons["Allow"].exists else { return false }
      alert.buttons["Allow"].tap()
      return true
    }

    let app = XCUIApplication()
    app.launchEnvironment["LYNX_BUNDLE_URL"] =
      ProcessInfo.processInfo.environment["LYNX_BUNDLE_URL"]
      ?? "http://localhost:3000/host-native/main.lynx.bundle"
    app.launch()
    app.tap()

    let loadButton = app.descendants(matching: .any)
      .matching(NSPredicate(format: "label == %@", "Load remote catalog"))
      .firstMatch
    XCTAssertTrue(loadButton.waitForExistence(timeout: 30))
    loadButton.tap()

    let singleton = app.descendants(matching: .any)
      .matching(NSPredicate(format: "label == %@", "Shared singleton verified"))
      .firstMatch
    XCTAssertTrue(singleton.waitForExistence(timeout: 60))
    XCTAssertTrue(app.staticTexts["Compiled imports ready"].exists)
    XCTAssertTrue(app.staticTexts["Runtime API ready"].exists)

    let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
    attachment.name = "Orbit Control federation loaded"
    attachment.lifetime = .keepAlways
    add(attachment)
  }
}
