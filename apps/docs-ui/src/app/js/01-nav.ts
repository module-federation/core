export default function () {
  const SECT_CLASS_RX = /^sect(\d)$/;

  const navContainer = document.querySelector('.nav-container');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = navContainer.querySelector<HTMLElement>('.nav');

  navToggle.addEventListener('click', showNav);
  navContainer.addEventListener('click', trapEvent);

  const menuPanel = navContainer.querySelector('[data-panel=menu]');
  if (!menuPanel) return;
  const explorePanel = navContainer.querySelector('[data-panel=explore]');

  let currentPageItem = menuPanel.querySelector('.is-current-page');
  const originalPageItem = currentPageItem;
  if (currentPageItem) {
    activateCurrentPath(currentPageItem);
    scrollItemToMidpoint(menuPanel, currentPageItem.querySelector('.nav-link'));
  } else {
    menuPanel.scrollTop = 0;
  }

  find(menuPanel, '.nav-item-toggle').forEach((btn) => {
    const li = btn.parentElement;
    btn.addEventListener('click', toggleActive.bind(li));
    const navItemSpan = findNextElement(btn, '.nav-text');
    if (navItemSpan) {
      navItemSpan.style.cursor = 'pointer';
      navItemSpan.addEventListener('click', toggleActive.bind(li));
    }
  });

  if (explorePanel) {
    explorePanel
      .querySelector('.context')
      .addEventListener('click', () => {
        // NOTE logic assumes there are only two panels
        find(nav, '[data-panel]').forEach((panel) => {
          panel.classList.toggle('is-active');
        });
      });
  }

  // NOTE prevent text from being selected by double click
  menuPanel.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.detail > 1) e.preventDefault();
  });

  function onHashChange() {
    let navLink;
    let hash = window.location.hash;
    if (hash) {
      if (hash.indexOf('%')) hash = decodeURIComponent(hash);
      navLink = menuPanel.querySelector('.nav-link[href="' + hash + '"]');
      if (!navLink) {
        const targetNode = document.getElementById(hash.slice(1));
        if (targetNode) {
          let current = targetNode;
          const ceiling = document.querySelector('article.doc');
          while ((current = current.parentNode as HTMLElement) && current !== ceiling) {
            let id = current.id;
            // NOTE: look for section heading
            if (!id && ((id as unknown) = SECT_CLASS_RX.test(current.className)))
              id = (current.firstElementChild || {}).id;
            if (
              id &&
              (navLink = menuPanel.querySelector(
                '.nav-link[href="#' + id + '"]'
              ))
            )
              break;
          }
        }
      }
    }
    let navItem;
    if (navLink) {
      navItem = navLink.parentNode;
    } else if (originalPageItem) {
      navLink = (navItem = originalPageItem).querySelector('.nav-link');
    } else {
      return;
    }
    if (navItem === currentPageItem) return;
    find(menuPanel, '.nav-item.is-active').forEach((el) => {
      el.classList.remove('is-active', 'is-current-path', 'is-current-page');
    });
    navItem.classList.add('is-current-page');
    currentPageItem = navItem;
    activateCurrentPath(navItem);
    scrollItemToMidpoint(menuPanel, navLink);
  }

  if (menuPanel.querySelector('.nav-link[href^="#"]')) {
    if (window.location.hash) onHashChange();
    window.addEventListener('hashchange', onHashChange);
  }

  function activateCurrentPath(navItem) {
    let ancestorClasses;
    let ancestor = navItem.parentNode;
    while (!(ancestorClasses = ancestor.classList).contains('nav-menu')) {
      if (ancestor.tagName === 'LI' && ancestorClasses.contains('nav-item')) {
        ancestorClasses.add('is-active', 'is-current-path');
      }
      ancestor = ancestor.parentNode;
    }
    navItem.classList.add('is-active');
  }

  function toggleActive() {
    if (this.classList.toggle('is-active')) {
      const padding = parseFloat(window.getComputedStyle(this).marginTop);
      const rect = this.getBoundingClientRect();
      const menuPanelRect = menuPanel.getBoundingClientRect();
      const overflowY = (
        rect.bottom -
        menuPanelRect.top -
        menuPanelRect.height +
        padding
      ).toFixed();
      if (+overflowY > 0)
        menuPanel.scrollTop += Math.min(
          +(rect.top - menuPanelRect.top - padding).toFixed(),
          +overflowY
        );
    }
  }

  function showNav(e) {
    if (navToggle.classList.contains('is-active')) return hideNav(e);
    trapEvent(e);
    const html = document.documentElement;
    html.classList.add('is-clipped--nav');
    navToggle.classList.add('is-active');
    navContainer.classList.add('is-active');
    const bounds = nav.getBoundingClientRect();
    const expectedHeight = window.innerHeight - Math.round(bounds.top);
    if (Math.round(bounds.height) !== expectedHeight)
      nav.style.height = expectedHeight + 'px';
    html.addEventListener('click', hideNav);
  }

  function hideNav(e) {
    trapEvent(e);
    const html = document.documentElement;
    html.classList.remove('is-clipped--nav');
    navToggle.classList.remove('is-active');
    navContainer.classList.remove('is-active');
    html.removeEventListener('click', hideNav);
  }

  function trapEvent(e) {
    e.stopPropagation();
  }

  function scrollItemToMidpoint(panel, el) {
    const rect = panel.getBoundingClientRect();
    let effectiveHeight = rect.height;
    const navStyle = window.getComputedStyle(nav);
    if (navStyle.position === 'sticky')
      effectiveHeight -= rect.top - parseFloat(navStyle.top);
    panel.scrollTop = Math.max(
      0,
      (el.getBoundingClientRect().height - effectiveHeight) * 0.5 + el.offsetTop
    );
  }

  function find(from, selector) {
    return [].slice.call(from.querySelectorAll(selector));
  }

  function findNextElement(from, selector) {
    const el = from.nextElementSibling;
    return el && selector
      ? el[el.matches ? 'matches' : 'msMatchesSelector'](selector) && el
      : el;
  }
}
