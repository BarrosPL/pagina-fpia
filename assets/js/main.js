/* ==========================================================================
   FPIA — Página de vendas
   Comportamentos: menu mobile, header ao rolar, FAQ, revelação, CTA fixa.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     >>> TROQUE O LINK DO CHECKOUT AQUI <<<
     Este é o único lugar a editar. Ao carregar a página, o link é aplicado
     em TODOS os botões "Quero me inscrever" (cabeçalho, topo, oferta e a
     barra fixa do mobile) — não é preciso mexer no index.html.

     Os mesmos links já estão no HTML como reserva, para os botões
     funcionarem mesmo se o JavaScript não carregar.
     ------------------------------------------------------------------------ */
  var LINK_CHECKOUT = 'https://pay.kiwify.com.br/ftNJjs8';

  // true = abre o checkout em uma nova aba (deixa a página de vendas aberta)
  var CHECKOUT_NOVA_ABA = false;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- CTAs -- */
  var ctas = document.querySelectorAll('[data-cta]');
  Array.prototype.forEach.call(ctas, function (cta) {
    if (LINK_CHECKOUT) {
      cta.href = LINK_CHECKOUT;
      if (CHECKOUT_NOVA_ABA) {
        cta.target = '_blank';
        cta.rel = 'noopener';
      }
    } else if (!cta.getAttribute('href') || cta.getAttribute('href') === '#') {
      cta.href = '#oferta';
    }
  });

  /* ------------------------------------------------------- menu (mobile) -- */
  var header = document.getElementById('header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav-principal');

  function closeNav() {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* -------------------------------------------- header compacto ao rolar -- */
  var stickyCta = document.querySelector('.cta-fixed');
  var heroSection = document.getElementById('topo');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('is-stuck', y > 24);

    if (stickyCta && heroSection) {
      stickyCta.classList.toggle('is-visible', y > heroSection.offsetHeight * 0.75);
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------- FAQ ----- */
  var questions = document.querySelectorAll('.faq__q');
  Array.prototype.forEach.call(questions, function (question) {
    question.addEventListener('click', function () {
      var panel = document.getElementById(question.getAttribute('aria-controls'));
      var open = question.getAttribute('aria-expanded') === 'true';

      question.setAttribute('aria-expanded', String(!open));
      question.closest('.faq__item').classList.toggle('is-open', !open);
      if (panel) panel.hidden = open;
    });
  });

  /* --------------------------------------------------- revelação ao rolar - */
  var revealables = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (!entry.isIntersecting) return;
        var delay = Math.min(index, 5) * 70;
        setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealables, function (el) { observer.observe(el); });
  }

  /* -------------------------------------------------- vídeo do hero ------ */
  var player = document.querySelector('[data-player]');
  var video = document.getElementById('video-cta');

  if (player && video) {
    var playBtn = player.querySelector('[data-player-play]');

    function iniciarVideo() {
      player.classList.add('is-playing');
      video.controls = true;   // controles nativos só depois do play
      video.muted = false;     // clique é gesto do usuário: o som é liberado
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          // se o navegador recusar, volta a mostrar a capa com o botão
          player.classList.remove('is-playing');
          video.controls = false;
        });
      }
    }

    if (playBtn) playBtn.addEventListener('click', iniciarVideo);

    // No fim, volta para a capa para permitir rever
    video.addEventListener('ended', function () {
      var dur = video.duration;
      if (!isFinite(dur) || dur < 1 || video.currentTime < dur - 1) return;
      video.currentTime = 0;
      video.controls = false;
      player.classList.remove('is-playing');
    });

    // Pausa quando o hero sai da tela, para o áudio não seguir tocando
    if ('IntersectionObserver' in window && heroSection) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting && !video.paused) video.pause();
      }, { threshold: 0.2 }).observe(heroSection);
    }
  }

  /* ------------------------------------------------------- ano do rodapé - */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
