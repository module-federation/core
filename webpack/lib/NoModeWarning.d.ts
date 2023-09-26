export = NoModeWarning;
declare class NoModeWarning extends WebpackError {
  constructor();
}
import WebpackError = require('./WebpackError');
