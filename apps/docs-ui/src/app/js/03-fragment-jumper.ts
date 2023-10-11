export default function () {
  const article = document.querySelector('article.doc');
  const toolbar = document.querySelector('.toolbar');

  function decodeFragment(hash) {
    return (
      hash && (~hash.indexOf('%') ? decodeURIComponent(hash) : hash).slice(1)
    );
  }

  function computePosition(el, sum) {
    return article.contains(el)
      ? computePosition(el.offsetParent, el.offsetTop + sum)
      : sum;
  }

  function jumpToAnchor(e) {
    if (e) {
      if (e.altKey || e.ctrlKey) return;
      window.location.hash = '#' + this.id;
      e.preventDefault();
    }
    window.scrollTo(
      0,
      computePosition(this, 0) - toolbar.getBoundingClientRect().bottom,
    );
  }

  window.addEventListener('load', function jumpOnLoad() {
    let fragment, target;
    if (
      (fragment = decodeFragment(window.location.hash)) &&
      (target = document.getElementById(fragment))
    ) {
      jumpToAnchor.bind(target)();
      setTimeout(jumpToAnchor.bind(target), 0);
    }
    window.removeEventListener('load', jumpOnLoad);
  });

  Array.prototype.slice
    .call(document.querySelectorAll('a[href^="#"]'))
    .forEach((el) => {
      let fragment, target;
      if (
        (fragment = decodeFragment(el.hash)) &&
        (target = document.getElementById(fragment))
      ) {
        el.addEventListener('click', jumpToAnchor.bind(target));
      }
    });
}
