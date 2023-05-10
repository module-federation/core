export default function () {
  const toggle = document.getElementById('language-toggle');
  const dropdown = document.getElementById('language-dropdown');

  if (!toggle || !dropdown) return;

  toggle.addEventListener('click', (e) => {
    dropdown.classList.toggle('hidden');
    e.stopPropagation();
  });
}
