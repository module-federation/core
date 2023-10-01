export default function () {
  const wrappers = document.querySelectorAll('.version-wrapper');

  if (!wrappers) return;

  wrappers.forEach((wrapper) => {
    const toggle = wrapper.querySelector('.version-toggle');
    const dropdown = wrapper.querySelector('.version-dropdown');

    if (!dropdown || !toggle) return;

    toggle.addEventListener('click', (e) => {
      dropdown.classList.toggle('hidden');
      toggle.classList.toggle('bg-deep-purple-100');
      toggle.classList.toggle('bg-blue-gray-200');
      e.stopPropagation();
    });
  });
}
