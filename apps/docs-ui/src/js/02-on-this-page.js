(function () {
  'use strict';

  var sidebar = document.querySelector('aside.toc.sidebar');
  if (!sidebar) return;
  if (document.querySelector('body.-toc'))
    return sidebar.parentNode.removeChild(sidebar);
  var levels = parseInt(sidebar.dataset.levels || 2, 10);
  if (levels < 0) return;

  var articleSelector = 'article.doc';
  var article = document.querySelector(articleSelector);
  var headingsSelector = [];
  for (var level = 0; level <= levels; level++) {
    var headingSelector = [articleSelector];
    if (level) {
      for (var l = 1; l <= level; l++)
        headingSelector.push((l === 2 ? '.sectionbody>' : '') + '.sect' + l);
      headingSelector.push('h' + (level + 1) + '[id]');
    } else {
      headingSelector.push('h1[id].sect0');
    }
    headingsSelector.push(headingSelector.join('>'));
  }
  var headings = find(headingsSelector.join(','), article.parentNode);
  if (!headings.length) return sidebar.parentNode.removeChild(sidebar);

  var lastActiveFragment;
  var links = {};
  var list = headings.reduce(function (accum, heading) {
    var link = document.createElement('a');
    link.textContent = heading.textContent;
    links[(link.href = '#' + heading.id)] = link;
    var listItem = document.createElement('li');
    listItem.dataset.level = parseInt(heading.nodeName.slice(1), 10) - 1;
    listItem.appendChild(link);
    accum.appendChild(listItem);
    return accum;
  }, document.createElement('ul'));

  var menu = sidebar.querySelector('.toc-menu');
  if (!menu) (menu = document.createElement('div')).className = 'toc-menu';

  var title = document.createElement('h3');
  title.textContent = sidebar.dataset.title || 'Contents';
  menu.appendChild(title);
  menu.appendChild(list);

  var startOfContent =
    !document.getElementById('toc') &&
    article.querySelector('h1.page ~ :not(.is-before-toc)');
  if (startOfContent) {
    var embeddedToc = document.createElement('aside');
    embeddedToc.className = 'toc embedded';
    embeddedToc.appendChild(menu.cloneNode(true));
    startOfContent.parentNode.insertBefore(embeddedToc, startOfContent);
  }

  window.addEventListener('load', function () {
    onScroll();
    window.addEventListener('scroll', onScroll);
  });

  function onScroll() {
    var scrolledBy = window.pageYOffset;
    var buffer =
      getNumericStyleVal(document.documentElement, 'fontSize') * 1.15;
    var ceil = article.offsetTop;
    if (
      scrolledBy &&
      window.innerHeight + scrolledBy + 2 >=
        document.documentElement.scrollHeight
    ) {
      lastActiveFragment = Array.isArray(lastActiveFragment)
        ? lastActiveFragment
        : Array(lastActiveFragment || 0);
      var activeFragments = [];
      var lastIdx = headings.length - 1;
      headings.forEach(function (heading, idx) {
        var fragment = '#' + heading.id;
        if (
          idx === lastIdx ||
          heading.getBoundingClientRect().top +
            getNumericStyleVal(heading, 'paddingTop') >
            ceil
        ) {
          activeFragments.push(fragment);
          if (lastActiveFragment.indexOf(fragment) < 0)
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
      lastActiveFragment.forEach(function (fragment) {
        links[fragment].classList.remove('is-active');
      });
      lastActiveFragment = undefined;
    }
    var activeFragment;
    headings.some(function (heading) {
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
      var activeLink = links[activeFragment];
      activeLink.classList.add('is-active');
      if (list.scrollHeight > list.offsetHeight) {
        list.scrollTop = Math.max(
          0,
          activeLink.offsetTop + activeLink.offsetHeight - list.offsetHeight
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
})();
