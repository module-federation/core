export default function () {
  const toggleEl = document.querySelector('#mobile-nav-toggle');
  const nav = document.querySelector('#mobile-nav');
  if (!toggleEl || !nav) return;

  toggleEl.addEventListener('click', (event) => {
    nav.classList.toggle('hidden');

    const spanEls = toggleEl.querySelectorAll('span');

    // First burger line
    spanEls[0].classList.toggle('top-[7px]');
    spanEls[0].classList.toggle('rotate-45');

    // Second burger line
    spanEls[1].classList.toggle('opacity-0');

    // Third burger line
    spanEls[2].classList.toggle('top-[-8px]');
    spanEls[2].classList.toggle('-rotate-45');
  });
}
