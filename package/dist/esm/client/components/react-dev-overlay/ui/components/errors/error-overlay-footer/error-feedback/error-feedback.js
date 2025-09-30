import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { ThumbsUp } from '../../../../icons/thumbs/thumbs-up';
import { ThumbsDown } from '../../../../icons/thumbs/thumbs-down';
import { cx } from '../../../../utils/cx';
export function ErrorFeedback(param) {
    let { errorCode, className } = param;
    const [votedMap, setVotedMap] = useState({});
    const voted = votedMap[errorCode];
    const hasVoted = voted !== undefined;
    const disabled = process.env.__NEXT_TELEMETRY_DISABLED;
    const handleFeedback = useCallback(async (wasHelpful)=>{
        // Optimistically set feedback state without loading/error states to keep implementation simple
        setVotedMap((prev)=>({
                ...prev,
                [errorCode]: wasHelpful
            }));
        try {
            const response = await fetch((process.env.__NEXT_ROUTER_BASEPATH || '') + "/__nextjs_error_feedback?" + new URLSearchParams({
                errorCode,
                wasHelpful: wasHelpful.toString()
            }));
            if (!response.ok) {
                // Handle non-2xx HTTP responses here if needed
                console.error('Failed to record feedback on the server.');
            }
        } catch (error) {
            console.error('Failed to record feedback:', error);
        }
    }, [
        errorCode
    ]);
    return /*#__PURE__*/ _jsx("div", {
        className: cx('error-feedback', className),
        role: "region",
        "aria-label": "Error feedback",
        children: hasVoted ? /*#__PURE__*/ _jsx("p", {
            className: "error-feedback-thanks",
            role: "status",
            "aria-live": "polite",
            children: "Thanks for your feedback!"
        }) : /*#__PURE__*/ _jsxs(_Fragment, {
            children: [
                /*#__PURE__*/ _jsx("p", {
                    children: /*#__PURE__*/ _jsx("a", {
                        href: "https://nextjs.org/telemetry#error-feedback",
                        rel: "noopener noreferrer",
                        target: "_blank",
                        children: "Was this helpful?"
                    })
                }),
                /*#__PURE__*/ _jsx("button", {
                    "aria-disabled": disabled ? 'true' : undefined,
                    "aria-label": "Mark as helpful",
                    onClick: disabled ? undefined : ()=>handleFeedback(true),
                    className: cx('feedback-button', voted === true && 'voted'),
                    title: disabled ? 'Feedback disabled due to setting NEXT_TELEMETRY_DISABLED' : undefined,
                    type: "button",
                    children: /*#__PURE__*/ _jsx(ThumbsUp, {
                        "aria-hidden": "true"
                    })
                }),
                /*#__PURE__*/ _jsx("button", {
                    "aria-disabled": disabled ? 'true' : undefined,
                    "aria-label": "Mark as not helpful",
                    onClick: disabled ? undefined : ()=>handleFeedback(false),
                    className: cx('feedback-button', voted === false && 'voted'),
                    title: disabled ? 'Feedback disabled due to setting NEXT_TELEMETRY_DISABLED' : undefined,
                    type: "button",
                    children: /*#__PURE__*/ _jsx(ThumbsDown, {
                        "aria-hidden": "true",
                        // Optical alignment
                        style: {
                            translate: '1px 1px'
                        }
                    })
                })
            ]
        })
    });
}
export const styles = "\n  .error-feedback {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    white-space: nowrap;\n    color: var(--color-gray-900);\n  }\n\n  .error-feedback-thanks {\n    height: var(--size-24);\n    display: flex;\n    align-items: center;\n    padding-right: 4px; /* To match the 4px inner padding of the thumbs up and down icons */\n  }\n\n  .feedback-button {\n    background: none;\n    border: none;\n    border-radius: var(--rounded-md);\n    width: var(--size-24);\n    height: var(--size-24);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    cursor: pointer;\n\n    &:focus {\n      outline: var(--focus-ring);\n    }\n\n    &:hover {\n      background: var(--color-gray-alpha-100);\n    }\n\n    &:active {\n      background: var(--color-gray-alpha-200);\n    }\n  }\n\n  .feedback-button[aria-disabled='true'] {\n    opacity: 0.7;\n    cursor: not-allowed;\n  }\n\n  .feedback-button.voted {\n    background: var(--color-gray-alpha-200);\n  }\n\n  .thumbs-up-icon,\n  .thumbs-down-icon {\n    color: var(--color-gray-900);\n    width: var(--size-16);\n    height: var(--size-16);\n  }\n";

//# sourceMappingURL=error-feedback.js.map