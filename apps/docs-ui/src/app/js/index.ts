import '@asciidoctor/tabs/dist/js/tabs';
import './vendor/highlight.bundle.js';

import initNav from './01-nav';
import initOnThisPage from './02-on-this-page';
import initFragmentJumper from './03-fragment-jumper';
// import initPageVersions from './04-page-versions';
import initMobileNavbar from './05-mobile-navbar';
// import initCopyToClipboard from './06-copy-to-clipboard';
import pageLanguages from './07-page-languages';
import pageVersions from './08-page-versions';

initNav();
initOnThisPage();
initFragmentJumper();
// initPageVersions();
initMobileNavbar();
// initCopyToClipboard();
pageLanguages();
pageVersions();
