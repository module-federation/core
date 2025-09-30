import { _ as _tagged_template_literal_loose } from "@swc/helpers/_/_tagged_template_literal_loose";
function _templateObject() {
    const data = _tagged_template_literal_loose([
        "\n      :host(.dark) {\n        ",
        "\n        ",
        "\n      }\n\n      @media (prefers-color-scheme: dark) {\n        :host(:not(.light)) {\n          ",
        "\n          ",
        "\n        }\n      }\n    "
    ]);
    _templateObject = function() {
        return data;
    };
    return data;
}
import { jsx as _jsx } from "react/jsx-runtime";
import { css } from '../../utils/css';
const colors = "\n  /* Background Dark */\n  --color-background-100: #0a0a0a;\n  --color-background-200: #000000;\n\n  /* Syntax Dark */\n  --color-syntax-comment: #a0a0a0;\n  --color-syntax-constant: #ededed;\n  --color-syntax-function: #52a9ff;\n  --color-syntax-keyword: #f76e99;\n  --color-syntax-link: #0ac5b2;\n  --color-syntax-parameter: #f1a10d;\n  --color-syntax-punctuation: #ededed;\n  --color-syntax-string: #0ac5b2;\n  --color-syntax-string-expression: #0ac5b2;\n\n  /* Gray Scale Dark */\n  --color-gray-100: #1a1a1a;\n  --color-gray-200: #1f1f1f;\n  --color-gray-300: #292929;\n  --color-gray-400: #2e2e2e;\n  --color-gray-500: #454545;\n  --color-gray-600: #878787;\n  --color-gray-700: #8f8f8f;\n  --color-gray-800: #7d7d7d;\n  --color-gray-900: #a0a0a0;\n  --color-gray-1000: #ededed;\n\n  /* Gray Alpha Scale Dark */\n  --color-gray-alpha-100: rgba(255, 255, 255, 0.066);\n  --color-gray-alpha-200: rgba(255, 255, 255, 0.087);\n  --color-gray-alpha-300: rgba(255, 255, 255, 0.125);\n  --color-gray-alpha-400: rgba(255, 255, 255, 0.145);\n  --color-gray-alpha-500: rgba(255, 255, 255, 0.239);\n  --color-gray-alpha-600: rgba(255, 255, 255, 0.506);\n  --color-gray-alpha-700: rgba(255, 255, 255, 0.54);\n  --color-gray-alpha-800: rgba(255, 255, 255, 0.47);\n  --color-gray-alpha-900: rgba(255, 255, 255, 0.61);\n  --color-gray-alpha-1000: rgba(255, 255, 255, 0.923);\n\n  /* Blue Scale Dark */\n  --color-blue-100: #0f1b2d;\n  --color-blue-200: #10243e;\n  --color-blue-300: #0f3058;\n  --color-blue-400: #0d3868;\n  --color-blue-500: #0a4481;\n  --color-blue-600: #0091ff;\n  --color-blue-700: #0070f3;\n  --color-blue-800: #0060d1;\n  --color-blue-900: #52a9ff;\n  --color-blue-1000: #eaf6ff;\n\n  /* Red Scale Dark */\n  --color-red-100: #2a1314;\n  --color-red-200: #3d1719;\n  --color-red-300: #551a1e;\n  --color-red-400: #671e22;\n  --color-red-500: #822025;\n  --color-red-600: #e5484d;\n  --color-red-700: #e5484d;\n  --color-red-800: #da3036;\n  --color-red-900: #ff6369;\n  --color-red-1000: #ffecee;\n\n  /* Amber Scale Dark */\n  --color-amber-100: #271700;\n  --color-amber-200: #341c00;\n  --color-amber-300: #4a2900;\n  --color-amber-400: #573300;\n  --color-amber-500: #693f05;\n  --color-amber-600: #e79c13;\n  --color-amber-700: #ffb224;\n  --color-amber-800: #ff990a;\n  --color-amber-900: #f1a10d;\n  --color-amber-1000: #fef3dd;\n\n  /* Green Scale Dark */\n  --color-green-100: #0b2211;\n  --color-green-200: #0f2c17;\n  --color-green-300: #11351b;\n  --color-green-400: #0c461b;\n  --color-green-500: #126427;\n  --color-green-600: #1a9338;\n  --color-green-700: #46a758;\n  --color-green-800: #388e4a;\n  --color-green-900: #63c174;\n  --color-green-1000: #e5fbeb;\n\n  /* Turbopack Dark - Temporary */\n  --color-turbopack-text-red: #ff6d92;\n  --color-turbopack-text-blue: #45b2ff;\n  --color-turbopack-border-red: #6e293b;\n  --color-turbopack-border-blue: #284f80;\n  --color-turbopack-background-red: #250d12;\n  --color-turbopack-background-blue: #0a1723;\n";
const base = "\n  --color-font: white;\n  --color-backdrop: rgba(0, 0, 0, 0.8);\n  --color-border-shadow: rgba(255, 255, 255, 0.145);\n\n  --color-title-color: #fafafa;\n  --color-stack-notes: #a9a9a9;\n";
export function DarkTheme() {
    return /*#__PURE__*/ _jsx("style", {
        children: css(_templateObject(), base, colors, base, colors)
    });
}

//# sourceMappingURL=dark-theme.js.map