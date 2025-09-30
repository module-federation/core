import Anser from 'next/dist/compiled/anser';
import stripAnsi from 'next/dist/compiled/strip-ansi';
// Strip leading spaces out of the code frame
export function formatCodeFrame(codeFrame) {
    const lines = codeFrame.split(/\r?\n/g);
    // Find the minimum length of leading spaces after `|` in the code frame
    const miniLeadingSpacesLength = lines.map((line)=>/^>? +\d+ +\| [ ]+/.exec(stripAnsi(line)) === null ? null : /^>? +\d+ +\| ( *)/.exec(stripAnsi(line))).filter(Boolean).map((v)=>v.pop()).reduce((c, n)=>isNaN(c) ? n.length : Math.min(c, n.length), NaN);
    // When the minimum length of leading spaces is greater than 1, remove them
    // from the code frame to help the indentation looks better when there's a lot leading spaces.
    if (miniLeadingSpacesLength > 1) {
        return lines.map((line, a)=>~(a = line.indexOf('|')) ? line.substring(0, a) + line.substring(a).replace("^\\ {" + miniLeadingSpacesLength + "}", '') : line).join('\n');
    }
    return lines.join('\n');
}
export function groupCodeFrameLines(formattedFrame) {
    // Map the decoded lines to a format that can be rendered
    const decoded = Anser.ansiToJson(formattedFrame, {
        json: true,
        use_classes: true,
        remove_empty: true
    });
    const lines = [];
    let line = [];
    for (const token of decoded){
        if (token.content === '\n') {
            lines.push(line);
            line = [];
        } else {
            line.push(token);
        }
    }
    if (line.length > 0) {
        lines.push(line);
    }
    return lines;
}
export function parseLineNumberFromCodeFrameLine(line, stackFrame) {
    var _line_, _line_1, _stackFrame_lineNumber;
    let lineNumberToken;
    let lineNumber;
    // parse line number from line first 2 tokens
    // e.g. ` > 1 | const foo = 'bar'` => `1`, first token is `1 |`
    // e.g. `  2 | const foo = 'bar'` => `2`. first 2 tokens are ' ' and ' 2 |'
    // console.log('line', line)
    if (((_line_ = line[0]) == null ? void 0 : _line_.content) === '>' || ((_line_1 = line[0]) == null ? void 0 : _line_1.content) === ' ') {
        var _lineNumberToken_content_replace, _lineNumberToken_content;
        lineNumberToken = line[1];
        lineNumber = lineNumberToken == null ? void 0 : (_lineNumberToken_content = lineNumberToken.content) == null ? void 0 : (_lineNumberToken_content_replace = _lineNumberToken_content.replace('|', '')) == null ? void 0 : _lineNumberToken_content_replace.trim();
    }
    // When the line number is possibly undefined, it can be just the non-source code line
    // e.g. the ^ sign can also take a line, we skip rendering line number for it
    return {
        lineNumber,
        isErroredLine: lineNumber === ((_stackFrame_lineNumber = stackFrame.lineNumber) == null ? void 0 : _stackFrame_lineNumber.toString())
    };
}

//# sourceMappingURL=parse-code-frame.js.map