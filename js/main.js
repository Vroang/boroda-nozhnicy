/* Барбершоп «Борода и Ножницы» — интерактив без библиотек */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.header');

  /* --- Шапка: фон при прокрутке --- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Бургер-меню --- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  var desktop = window.matchMedia('(min-width: 1024px)');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  desktop.addEventListener('change', function () { setMenu(false); });

  /* --- Вкладки услуг --- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs__tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    // на телефоне докрутить ленту вкладок, чтобы активная была видна
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  // начальное состояние без прокрутки страницы
  tabs.forEach(function (t, i) { document.getElementById(t.getAttribute('aria-controls')).hidden = i !== 0; });

  /* --- Появление блоков при прокрутке --- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); revealObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    // соседние карточки появляются лесенкой
    reveals.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (sib > 0 && sib < 6) el.style.transitionDelay = (sib * 70) + 'ms';
      revealObs.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- Плавающая кнопка: прячем на первом экране, в контактах и подвале --- */
  var fab = document.querySelector('.fab');
  if (fab && 'IntersectionObserver' in window) {
    var hiders = document.querySelectorAll('.hero, #contacts, .footer');
    var visible = new Set();
    var fabObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
      });
      fab.classList.toggle('is-visible', visible.size === 0);
    });
    hiders.forEach(function (el) { fabObs.observe(el); });
  }

  /* --- Галерея: увеличение фото --- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lb = document.querySelector('.lightbox');
  if (lb && items.length && typeof lb.showModal === 'function') {
    var lbSource = lb.querySelector('source');
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__caption');
    var lbCount = lb.querySelector('.lightbox__count');
    var current = 0;
    var opener = null;

    var show = function (i) {
      current = (i + items.length) % items.length;
      var item = items[current];
      var base = item.getAttribute('data-full');
      var alt = item.querySelector('img').alt;
      lbSource.srcset = base + '.webp';
      lbImg.src = base + '.jpg';
      lbImg.alt = alt;
      lbCap.textContent = alt;
      lbCount.textContent = (current + 1) + ' / ' + items.length;
    };

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        opener = item;
        show(i);
        lb.showModal();
        document.body.classList.add('is-locked');
      });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
      if (opener) opener.focus();
    });
    // клик по тёмному фону — закрыть
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__figure')) lb.close();
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
    // свайп на телефоне
    var startX = null, startY = null;
    lb.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
      startX = startY = null;
    });
  }
})();
