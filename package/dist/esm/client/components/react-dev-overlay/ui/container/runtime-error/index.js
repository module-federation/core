import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { CodeFrame } from '../../components/code-frame/code-frame';
import { CallStack } from '../../components/errors/call-stack/call-stack';
import { PSEUDO_HTML_DIFF_STYLES } from './component-stack-pseudo-html';
import { useFrames } from '../../../utils/get-error-by-type';
export function RuntimeError(param) {
    let { error, dialogResizerRef } = param;
    const frames = useFrames(error);
    const firstFrame = useMemo(()=>{
        const firstFirstPartyFrameIndex = frames.findIndex((entry)=>!entry.ignored && Boolean(entry.originalCodeFrame) && Boolean(entry.originalStackFrame));
        var _frames_firstFirstPartyFrameIndex;
        return (_frames_firstFirstPartyFrameIndex = frames[firstFirstPartyFrameIndex]) != null ? _frames_firstFirstPartyFrameIndex : null;
    }, [
        frames
    ]);
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            firstFrame && /*#__PURE__*/ _jsx(CodeFrame, {
                stackFrame: firstFrame.originalStackFrame,
                codeFrame: firstFrame.originalCodeFrame
            }),
            frames.length > 0 && /*#__PURE__*/ _jsx(CallStack, {
                dialogResizerRef: dialogResizerRef,
                frames: frames
            })
        ]
    });
}
export const styles = "\n  " + PSEUDO_HTML_DIFF_STYLES + "\n";

//# sourceMappingURL=index.js.map