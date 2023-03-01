export default function() {

  const toggle = document.querySelector('.page-languages .language-menu-toggle');
  if (!toggle) return;

  const selector = document.querySelector('.page-languages');

  toggle.addEventListener('click', (e) => {
    selector.classList.toggle('is-active');
    e.stopPropagation(); // trap event
  });

  document.documentElement.addEventListener('click', () => {
    selector.classList.remove('is-active');
  });
}
