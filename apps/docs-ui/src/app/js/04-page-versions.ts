export default function () {
  const toggle = document.querySelector('.page-versions .version-menu-toggle');
  if (!toggle) return;

  const selector = document.querySelector('.page-versions');

  toggle.addEventListener('click', (e) => {
    selector.classList.toggle('is-active');
    e.stopPropagation(); // trap event
  });

  document.documentElement.addEventListener('click', () => {
    selector.classList.remove('is-active');
  });
}
