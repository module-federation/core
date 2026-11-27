export = ImportedBindingAssignmentError;
declare class ImportedBindingAssignmentError extends WebpackError {
    /**
     * Creates an instance of ImportedBindingAssignmentError.
     * @param {string} name the local name of the namespace binding
     */
    constructor(name: string);
}
import WebpackError = require("./WebpackError");
