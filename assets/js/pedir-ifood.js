/* Los Paleteros — roteamento dos botões "Pedir".
   Antes de abrir o iFood, checa por geolocalização se há uma LOJA PRÓPRIA
   (os pins VERDES do mapa "Onde Encontrar", nome "Los Paleteros — ...") num raio de 30 km.
   Estas são as lojas que entregam pelo iFood; revendedores (pins magenta) não contam.
   Com loja própria perto -> abre o iFood (e registra o evento no GA).
   Sem loja própria em 30 km, sem permissão ou erro -> leva à seção "Onde Encontrar". */
(function () {
  var RAIO_KM = 30;
  var LOJAS = [[-25.439099,-49.281297],[-26.25749,-53.609288]];

  function dist(la1, lo1, la2, lo2) {
    var R = 6371, p = Math.PI / 180;
    var dLa = (la2 - la1) * p, dLo = (lo2 - lo1) * p;
    var a = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
            Math.cos(la1 * p) * Math.cos(la2 * p) *
            Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function temLojaPerto(la, lo) {
    for (var i = 0; i < LOJAS.length; i++) {
      if (dist(la, lo, LOJAS[i][0], LOJAS[i][1]) <= RAIO_KM) return true;
    }
    return false;
  }
  function irAoMapa() {
    var sec = document.getElementById('onde-encontrar');
    if (sec) { sec.scrollIntoView({ behavior: 'smooth' }); history.replaceState(null, '', '#onde-encontrar'); }
    else { location.href = 'index.html#onde-encontrar'; }
  }
  function irAoIfood(href) {
    if (typeof gtag === 'function') {
      gtag('event', 'click_pedir_ifood', { link_url: href, page: location.pathname });
    }
    location.href = href; // mesma aba garante abertura (callback async perde o "popup gesture")
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="ifood.com.br"]');
    if (!a) return;
    e.preventDefault();
    var href = a.href;
    if (!navigator.geolocation) { irAoMapa(); return; }
    document.documentElement.style.cursor = 'progress';
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        document.documentElement.style.cursor = '';
        if (temLojaPerto(pos.coords.latitude, pos.coords.longitude)) irAoIfood(href);
        else irAoMapa();
      },
      function () { document.documentElement.style.cursor = ''; irAoMapa(); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, true);
})();
