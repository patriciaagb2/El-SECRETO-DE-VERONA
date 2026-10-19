// Transición de salida al elegir un nuevo nodo; los enlaces siguen funcionando sin JavaScript.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduceMotion.matches) return;
      const destination = link.href;
      if (!destination || new URL(destination).origin !== location.origin) return;
      event.preventDefault();
      document.body.classList.add('saliendo');
      setTimeout(() => { location.href = destination; }, 320);
    });
  });
  window.addEventListener('pageshow', () => document.body.classList.remove('saliendo'));
})();
