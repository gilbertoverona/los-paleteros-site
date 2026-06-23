/* Los Paleteros — banner de consentimento de cookies (LGPD).
   O Google Analytics só coleta dados depois que o usuário clica em "Aceitar".
   A escolha fica salva em localStorage ('lp_cookie_consent' = accepted | denied).
   O link "Cookies" no rodapé chama window.lpCookiePrefs() para reabrir o banner. */
(function () {
  var KEY = 'lp_cookie_consent';
  var GA = 'G-9R4057CDQT';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function enableGA() {
    try { window['ga-disable-' + GA] = false; } catch (e) {}
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      gtag('event', 'page_view'); // registra a visita atual após o aceite
    }
  }
  function disableGA() {
    try { window['ga-disable-' + GA] = true; } catch (e) {}
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }

  function hide() {
    var d = document.getElementById('lp-cookie');
    if (d) d.classList.remove('show');
  }

  function banner() {
    var d = document.getElementById('lp-cookie');
    if (d) { d.classList.add('show'); return; }
    d = document.createElement('div');
    d.id = 'lp-cookie';
    d.className = 'lp-cookie show';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML =
      '<div class="lp-cookie-in">' +
        '<p>Usamos cookies para medir o tráfego do site (Google Analytics) e melhorar sua experiência. ' +
        'Você escolhe. Veja a nossa <a href="privacidade.html">Política de Privacidade</a>.</p>' +
        '<div class="lp-cookie-bts">' +
          '<button type="button" class="lp-ck-no">Recusar</button>' +
          '<button type="button" class="lp-ck-yes">Aceitar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);
    d.querySelector('.lp-ck-yes').addEventListener('click', function () { set('accepted'); enableGA(); hide(); });
    d.querySelector('.lp-ck-no').addEventListener('click', function () { set('denied'); disableGA(); hide(); });
  }

  // permite reabrir as preferências pelo link "Cookies" no rodapé
  window.lpCookiePrefs = function () { banner(); return false; };

  var c = get();
  if (c === 'accepted') { enableGA(); }
  else if (c !== 'denied') { banner(); } // ainda não escolheu → mostra o banner
})();
