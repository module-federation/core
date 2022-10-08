@echo off

SET COMMAND=%1

IF "%COMMAND%" == "enable" (
  echo "Setting registry to local registry"
  echo "To Disable: yarn local-registry disable"
  npm config set registry "http://localhost:4873/"
	yarn config set registry "http://localhost:4873/"
)

IF "%COMMAND%" == "disable" (
  npm config delete registry
  yarn config delete registry
  SET CURRENT_NPM_REGISTRY=('npm config get registry')
  SET CURRENT_YARN_REGISTRY=('yarn config get registry')

  echo "Reverting registries"
  echo "  > NPM:  %CURRENT_NPM_REGISTRY%"
  echo "  > YARN: %CURRENT_YARN_REIGSTRY%"
)

IF "%COMMAND%" == "clear" (
  echo "Clearing Local Registry"
  RD /S /Q "./build/local-registry/storage"
)

IF "%COMMAND%" == "start" (
  echo "Starting Local Registry"
  SET VERDACCIO_HANDLE_KILL_SIGNALS=true
  npx verdaccio --config "./.verdaccio/config.yml"
)
