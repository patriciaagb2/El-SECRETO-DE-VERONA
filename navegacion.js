/* Navegación entre documentos HTML sin recargar el reproductor musical.
   Requiere un servidor HTTP (GitHub Pages o Live Server). */
(() => {
  const main = document.querySelector('main#contenido');
  if (!main) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const music = document.createElement('aside');
  music.className = 'musica-persistente';
  music.setAttribute('aria-label', 'Música de ambientación');
  music.innerHTML = `
    <div class="musica-encabezado">
      <span class="musica-titulo">♫ Música para la lectura</span>
      <button type="button" class="musica-plegar" aria-expanded="true" aria-controls="musica-reproductor">Ocultar</button>
    </div>
    <p>Presioná Play para acompañar tu recorrido.</p>
    <div id="musica-reproductor" class="musica-reproductor">
      <iframe src="https://www.youtube.com/embed/f6qZUCi7ToQ?start=5" title="Música para ambientar Romeo y Julieta" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>`;
  document.body.appendChild(music);
  const toggle = music.querySelector('.musica-plegar');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = expanded ? 'Mostrar' : 'Ocultar';
    music.classList.toggle('musica-oculta', expanded);
  });

  let navigating = false;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function navigate(url, addHistory = true) {
    if (navigating) return;
    navigating = true;
    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const incoming = html.querySelector('main#contenido');
      if (!incoming) throw new Error('No se encontró el contenido de la escena');
      if (!reduceMotion.matches) {
        document.body.classList.add('saliendo');
        await wait(320);
      }
      main.innerHTML = incoming.innerHTML;
      document.body.className = html.body.className;
      document.title = html.title;
      if (addHistory) history.pushState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'instant' });
      // La animación se reinicia sin tocar el iframe de música.
      main.style.animation = 'none';
      void main.offsetWidth;
      main.style.animation = '';
    } catch (error) {
      console.warn('No se pudo navegar sin recargar:', error);
      // En navegación normal, el enlace sigue funcionando como alternativa.
      if (addHistory) window.location.assign(url);
      else window.location.reload();
    } finally {
      navigating = false;
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('main#contenido a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
    event.preventDefault();
    navigate(url.href);
  });
  window.addEventListener('popstate', () => navigate(location.href, false));
})();
