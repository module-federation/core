(function () {
  'use strict';

  var navbarBurger = document.querySelector('.navbar-burger');
  if (!navbarBurger) return;
  navbarBurger.addEventListener('click', toggleNavbarMenu.bind(navbarBurger));

  function toggleNavbarMenu(e) {
    e.stopPropagation(); // trap event
    document.documentElement.classList.toggle('is-clipped--navbar');
    this.classList.toggle('is-active');
    var menu = document.getElementById(this.dataset.target);
    if (menu.classList.toggle('is-active')) {
      menu.style.maxHeight = '';
      var expectedMaxHeight =
        window.innerHeight - Math.round(menu.getBoundingClientRect().top);
      var actualMaxHeight = parseInt(
        window.getComputedStyle(menu).maxHeight,
        10
      );
      if (actualMaxHeight !== expectedMaxHeight)
        menu.style.maxHeight = expectedMaxHeight + 'px';
    }
  }
})();
