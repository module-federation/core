"use strict";
/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");
var makeSerializable = require("webpack/lib/util/makeSerializable");
var ContainerExposedDependency = /** @class */ (function (_super) {
    __extends(ContainerExposedDependency, _super);
    /**
     * @param {string} exposedName public name
     * @param {string} request request to module
     */
    function ContainerExposedDependency(exposedName, request) {
        var _this = _super.call(this, request) || this;
        _this.exposedName = exposedName;
        _this.request = request;
        return _this;
    }
    Object.defineProperty(ContainerExposedDependency.prototype, "type", {
        get: function () {
            return 'container exposed';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContainerExposedDependency.prototype, "category", {
        get: function () {
            return 'esm';
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @returns {string | null} an identifier to merge equal requests
     */
    ContainerExposedDependency.prototype.getResourceIdentifier = function () {
        return "exposed dependency ".concat(this.exposedName, "=").concat(this.request);
    };
    /**
     * @param {ObjectSerializerContext} context context
     */
    ContainerExposedDependency.prototype.serialize = function (context) {
        context.write(this.exposedName);
        _super.prototype.serialize.call(this, context);
    };
    /**
     * @param {ObjectDeserializerContext} context context
     */
    ContainerExposedDependency.prototype.deserialize = function (context) {
        this.exposedName = context.read();
        _super.prototype.deserialize.call(this, context);
    };
    return ContainerExposedDependency;
}(ModuleDependency));
makeSerializable(ContainerExposedDependency, 'enhanced/lib/container/ContainerExposedDependency');
exports.default = ContainerExposedDependency;
