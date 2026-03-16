require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "module-federation-metro-cache"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/module-federation/core"
  s.license      = package["license"]
  s.authors      = "Module Federation Contributors"
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/module-federation/core.git", :tag => s.version }
  s.source_files = "ios/**/*.{h,m,mm,cpp}"

  install_modules_dependencies(s)
end
