import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Base } from '../styles/base';
import { Colors } from '../styles/colors';
import { CssReset } from '../styles/css-reset';
import { ComponentStyles } from '../styles/component-styles';
import { ShadowPortal } from '../components/shadow-portal';
import { DarkTheme } from '../styles/dark-theme';
export const withShadowPortal = (Story)=>/*#__PURE__*/ _jsxs(ShadowPortal, {
        children: [
            /*#__PURE__*/ _jsx(CssReset, {}),
            /*#__PURE__*/ _jsx(Base, {}),
            /*#__PURE__*/ _jsx(Colors, {}),
            /*#__PURE__*/ _jsx(ComponentStyles, {}),
            /*#__PURE__*/ _jsx(DarkTheme, {}),
            /*#__PURE__*/ _jsx(Story, {})
        ]
    });

//# sourceMappingURL=with-shadow-portal.js.map