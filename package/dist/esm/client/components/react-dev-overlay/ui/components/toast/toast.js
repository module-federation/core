import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { cx } from '../../utils/cx';
export const Toast = function Toast(param) {
    let { onClick, children, className, ...props } = param;
    return /*#__PURE__*/ _jsx("div", {
        ...props,
        onClick: (e)=>{
            if (!e.target.closest('a')) {
                e.preventDefault();
            }
            return onClick == null ? void 0 : onClick();
        },
        className: cx('nextjs-toast', className),
        children: /*#__PURE__*/ _jsx("div", {
            "data-nextjs-toast-wrapper": true,
            children: children
        })
    });
};

//# sourceMappingURL=toast.js.map