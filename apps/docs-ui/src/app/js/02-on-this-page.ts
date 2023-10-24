export default function () {
  const sidebar = document.querySelector<HTMLElement>('aside.toc.sidebar');
  if (!sidebar) return;
  if (document.querySelector('body.-toc'))
    return sidebar.parentNode.removeChild(sidebar);
  const levels = parseInt(sidebar.dataset.levels || '2', 10);
  if (levels < 0) return;

  const articleSelector = 'article.doc';
  const article = document.querySelector<HTMLElement>(articleSelector);
  const headingsSelector = [];
  for (let level = 0; level <= levels; level++) {
    const headingSelector = [articleSelector];
    if (level) {
      for (let l = 1; l <= level; l++)
        headingSelector.push((l === 2 ? '.sectionbody>' : '') + '.sect' + l);
      headingSelector.push('h' + (level + 1) + '[id]');
    } else {
      headingSelector.push('h1[id].sect0');
    }
    headingsSelector.push(headingSelector.join('>'));
  }
  const headings = find(headingsSelector.join(','), article.parentNode);
  if (!headings.length) return sidebar.parentNode.removeChild(sidebar);

  let lastActiveFragment;
  const links = {};
  const list = headings.reduce((accum, heading) => {
    const link = document.createElement('a');
    link.textContent = heading.textContent;
    links[(link.href = '#' + heading.id)] = link;
    const listItem = document.createElement('li') as HTMLElement;
    listItem.dataset.level = (
      parseInt(heading.nodeName.slice(1), 10) - 1
    ).toString();
    listItem.appendChild(link);
    accum.appendChild(listItem);
    return accum;
  }, document.createElement('ul'));

  let menu = sidebar.querySelector('.toc-menu');
  if (!menu) (menu = document.createElement('div')).className = 'toc-menu';

  const title = document.createElement('h3');
  title.textContent = sidebar.dataset.title || 'On this page';
  menu.appendChild(title);
  menu.appendChild(list);

  const startOfContent =
    !document.getElementById('toc') &&
    article.querySelector('h1.page ~ :not(.is-before-toc)');
  if (startOfContent) {
    const embeddedToc = document.createElement('aside');
    embeddedToc.className = 'toc embedded';
    embeddedToc.appendChild(menu.cloneNode(true));
    startOfContent.parentNode.insertBefore(embeddedToc, startOfContent);
  }

  window.addEventListener('load', () => {
    onScroll();
    window.addEventListener('scroll', onScroll);
  });

  function onScroll() {
    const scrolledBy = window.pageYOffset;
    const buffer =
      getNumericStyleVal(document.documentElement, 'fontSize') * 1.15;
    const ceil = article.offsetTop;
    if (
      scrolledBy &&
      window.innerHeight + scrolledBy + 2 >=
        document.documentElement.scrollHeight
    ) {
      lastActiveFragment = Array.isArray(lastActiveFragment)
        ? lastActiveFragment
        : Array(lastActiveFragment || 0);
      const activeFragments = [];
      const lastIdx = headings.length - 1;
      headings.forEach((heading, idx) => {
        const fragment = '#' + heading.id;
        if (
          idx === lastIdx ||
          heading.getBoundingClientRect().top +
            getNumericStyleVal(heading, 'paddingTop') >
            ceil
        ) {
          activeFragments.push(fragment);
          if (!lastActiveFragment.includes(fragment))
            links[fragment].classList.add('is-active');
        } else if (~lastActiveFragment.indexOf(fragment)) {
          links[lastActiveFragment.shift()].classList.remove('is-active');
        }
      });
      list.scrollTop = list.scrollHeight - list.offsetHeight;
      lastActiveFragment =
        activeFragments.length > 1 ? activeFragments : activeFragments[0];
      return;
    }
    if (Array.isArray(lastActiveFragment)) {
      lastActiveFragment.forEach((fragment) => {
        links[fragment].classList.remove('is-active');
      });
      lastActiveFragment = undefined;
    }
    let activeFragment;
    headings.some((heading) => {
      if (
        heading.getBoundingClientRect().top +
          getNumericStyleVal(heading, 'paddingTop') -
          buffer >
        ceil
      )
        return true;
      activeFragment = '#' + heading.id;
    });
    if (activeFragment) {
      if (activeFragment === lastActiveFragment) return;
      if (lastActiveFragment)
        links[lastActiveFragment].classList.remove('is-active');
      const activeLink = links[activeFragment];
      activeLink.classList.add('is-active');
      if (list.scrollHeight > list.offsetHeight) {
        list.scrollTop = Math.max(
          0,
          activeLink.offsetTop + activeLink.offsetHeight - list.offsetHeight,
        );
      }
      lastActiveFragment = activeFragment;
    } else if (lastActiveFragment) {
      links[lastActiveFragment].classList.remove('is-active');
      lastActiveFragment = undefined;
    }
  }

  function find(selector, from) {
    return [].slice.call((from || document).querySelectorAll(selector));
  }

  function getNumericStyleVal(el, prop) {
    return parseFloat(window.getComputedStyle(el)[prop]);
  }
}
