export class Logger {
  private name: string;
  private isDebugEnabled: boolean;
  private color: string;

  constructor(name: string) {
    this.name = name;
    this.isDebugEnabled = false;
    this.color = this.stringToColor(name);

    // Check if debug is enabled in the browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.isDebugEnabled = localStorage.getItem('debug') === 'true';
    }

    // Check if debug is enabled in the Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      this.isDebugEnabled = process.env.DEBUG === 'true';
    }
  }

  public log(...messages: any[]): void {
    if (this.isDebugEnabled) {
      const infoStyle = `color: ${this.color}; font-weight: bold`;
      const logMessage = `%c[${this.name}]`;
      const stack =
        new Error().stack?.split('\n')[2]?.trim() ||
        'Stack information not available';

      if (typeof console !== 'undefined' && console.debug) {
        console.debug(logMessage, infoStyle, ...messages, `\n (${stack})`);

        // if (this.isDebugEnabledStack) {
        //   console.log(`%c${stack}`, 'color: grey; font-style: italic;');
        // }
      }
    }
  }

  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }
}
