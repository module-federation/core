export default function () {
  const CMD_RX = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm;
  const LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g;
  const TRAILING_SPACE_RX = / +$/gm;

  const config: Record<string, string | null> = (
    document.getElementById('site-script') || { dataset: {} }
  ).dataset;
  const uiRootPath = config.uiRootPath == null ? '.' : config.uiRootPath;
  const svgAs = config.svgAs;
  const supportsCopy = window.navigator.clipboard;

  [].slice
    .call(
      document.querySelectorAll('.doc pre.highlight, .doc .literalblock pre'),
    )
    .forEach((pre) => {
      let code, language, lang, copy, toast, toolbox;
      if (pre.classList.contains('highlight')) {
        code = pre.querySelector('code');
        if ((language = code.dataset.lang) && language !== 'console') {
          (lang = document.createElement('span')).className = 'source-lang';
          lang.appendChild(document.createTextNode(language));
        }
      } else if (pre.innerText.startsWith('$ ')) {
        const block = pre.parentNode.parentNode;
        block.classList.remove('literalblock');
        block.classList.add('listingblock');
        pre.classList.add('highlightjs', 'highlight');
        (code = document.createElement('code')).className =
          'language-console hljs';
        code.dataset.lang = 'console';
        code.appendChild(pre.firstChild);
        pre.appendChild(code);
      } else {
        return;
      }
      (toolbox = document.createElement('div')).className = 'source-toolbox';
      if (lang) toolbox.appendChild(lang);
      if (supportsCopy) {
        (copy = document.createElement('button')).className = 'copy-button';
        copy.setAttribute('title', 'Copy to clipboard');
        if (svgAs === 'svg') {
          const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
          );
          svg.setAttribute('class', 'copy-icon');
          const use = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'use',
          );
          use.setAttribute(
            'href',
            uiRootPath + '/img/octicons-16.svg#icon-clippy',
          );
          svg.appendChild(use);
          copy.appendChild(svg);
        } else {
          const img = document.createElement('img');
          img.src = uiRootPath + '/img/octicons-16.svg#view-clippy';
          img.alt = 'copy icon';
          img.className = 'copy-icon';
          copy.appendChild(img);
        }
        (toast = document.createElement('span')).className = 'copy-toast';
        toast.appendChild(document.createTextNode('Copied!'));
        copy.appendChild(toast);
        toolbox.appendChild(copy);
      }
      pre.parentNode.appendChild(toolbox);
      if (copy)
        copy.addEventListener('click', writeToClipboard.bind(copy, code));
    });

  function extractCommands(text) {
    const cmds = [];
    let m;
    while ((m = CMD_RX.exec(text)))
      cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'));
    return cmds.join(' && ');
  }

  function writeToClipboard(code) {
    let text = code.innerText.replace(TRAILING_SPACE_RX, '');
    if (code.dataset.lang === 'console' && text.startsWith('$ '))
      text = extractCommands(text);
    window.navigator.clipboard.writeText(text).then(
      () => {
        this.classList.add('clicked');
        this.offsetHeight; // eslint-disable-line no-unused-expressions
        this.classList.remove('clicked');
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }
}
