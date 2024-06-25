// simplified from acorn (MIT license)

function isNewLine(code: number): boolean {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
}

function codePointToString(ch: number): string {
  if (ch <= 0xffff) return String.fromCharCode(ch);
  ch -= 0x10000;
  return String.fromCharCode((ch >> 10) + 0xd800, (ch & 0x03ff) + 0xdc00);
}

export class Lexer {
  input = '';
  pos = 0;

  readString(input: string, pos: number): string | null {
    if (pos >= input.length) return null;
    this.input = input;
    this.pos = pos;

    const quote = this.input.charCodeAt(pos);
    if (!(quote === 34 || quote === 39)) return null;

    let out = '';
    let chunkStart = ++this.pos;
    //eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.pos >= this.input.length) return null;
      const ch = this.input.charCodeAt(this.pos);
      if (ch === quote) break;
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        const escaped = this.readEscapedChar();
        if (escaped === null) return null;
        out += escaped;
        chunkStart = this.pos;
      } else {
        if (isNewLine(ch)) return null;
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);

    return out;
  }

  readEscapedChar(): string | null {
    const ch = this.input.charCodeAt(++this.pos);
    let code: number | null;
    ++this.pos;
    switch (ch) {
      case 110:
        return '\n';
      case 114:
        return '\r';
      case 120:
        code = this.readHexChar(2);
        if (code === null) return null;
        return String.fromCharCode(code);
      case 117:
        code = this.readCodePoint();
        if (code === null) return null;
        return codePointToString(code);
      case 116:
        return '\t';
      case 98:
        return '\b';
      case 118:
        return '\u000b';
      case 102:
        return '\f';
      //@ts-ignore
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) {
          ++this.pos;
        }
      // fall through
      case 10:
        return '';
      case 56:
      case 57:
        return null;
      default:
        if (ch >= 48 && ch <= 55) {
          const match = this.input
            .slice(this.pos - 1, this.pos + 2)
            .match(/^[0-7]+/);
          if (match === null) return null;
          let octalStr = match[0];
          let octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          this.pos += octalStr.length - 1;
          const nextCh = this.input.charCodeAt(this.pos);
          if (octalStr !== '0' || nextCh === 56 || nextCh === 57) return null;
          return String.fromCharCode(octal);
        }
        if (isNewLine(ch)) return '';
        return String.fromCharCode(ch);
    }
  }

  readInt(radix: number, len: number): number | null {
    const start = this.pos;
    let total = 0;
    for (let i = 0; i < len; ++i, ++this.pos) {
      const code = this.input.charCodeAt(this.pos);
      let val: number;
      if (code >= 97) {
        val = code - 97 + 10;
      } else if (code >= 65) {
        val = code - 65 + 10;
      } else if (code >= 48 && code <= 57) {
        val = code - 48;
      } else {
        val = Infinity;
      }
      if (val >= radix) break;
      total = total * radix + val;
    }
    if (this.pos === start || (len != null && this.pos - start !== len))
      return null;
    return total;
  }

  readHexChar(len: number): number | null {
    return this.readInt(16, len);
  }

  readCodePoint(): number | null {
    const ch = this.input.charCodeAt(this.pos);
    let code: number | null;
    if (ch === 123) {
      ++this.pos;
      code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
      ++this.pos;
      if (code && code > 0x10ffff) return null;
    } else {
      code = this.readHexChar(4);
    }
    return code;
  }
}
