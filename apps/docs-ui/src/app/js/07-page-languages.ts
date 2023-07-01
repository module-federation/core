export default function () {
  const toggles = document.querySelectorAll('.language-toggle');

  if (!toggles) return;

  toggles.forEach((toggle) => {
    const dropdown = toggle.querySelector('.language-dropdown');

    if (!dropdown) return;

    toggle.addEventListener('click', (e) => {
      dropdown.classList.toggle('hidden');
      e.stopPropagation();
    });
  });
}
