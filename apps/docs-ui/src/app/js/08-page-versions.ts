export default function () {
  const toggles = document.querySelectorAll('.version-toggle');

  if (!toggles) return;

  toggles.forEach((toggle) => {
    const dropdown = toggle.querySelector('.version-dropdown');

    if (!dropdown) return;

    toggle.addEventListener('click', (e) => {
      dropdown.classList.toggle('hidden');
      e.stopPropagation();
    });
  });
}
