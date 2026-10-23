/* Volta Eskişehir — her bölüm ayrı korunur; biri hata verirse diğerleri çalışır.
   Android/WhatsApp içi tarayıcı için: yeni sekme, indirme, geçmiş (history) ve sayfa kilidi yok. */
(function () {
  'use strict';
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };
  function dene(ad, fn) { try { fn(); } catch (h) { if (window.console) console.warn('[' + ad + ']', h); } }

  function tl(x) {
    var s = Number(x).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (s.slice(-3) === ',00' ? s.slice(0, -3) : s) + ' TL';
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* --- kayarak görünme --- */
  dene('gor', function () {
    var el = $$('.gor');
    if (!el.length) return;
    var hepsi = function () { el.forEach(function (x) { x.classList.add('gorundu'); }); };
    if (!('IntersectionObserver' in window)) return hepsi();
    var io = new IntersectionObserver(function (g) {
      g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('gorundu'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    el.forEach(function (x) { io.observe(x); });
    setTimeout(hepsi, 3500);
  });

  /* --- mobil menü --- */
  dene('menu', function () {
    var dg = $('[data-menu]'), c = $('#cekmece');
    if (!dg || !c) return;
    var ust = $('.ust');
    function ayarla(acik) {
      if (acik && ust) c.style.top = Math.max(0, ust.getBoundingClientRect().bottom) + 'px';
      c.classList.toggle('acik', acik);
      dg.setAttribute('aria-expanded', acik ? 'true' : 'false');
      dg.setAttribute('aria-label', acik ? 'Menüyü kapat' : 'Menüyü aç');
      dg.innerHTML = acik
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    }
    dg.addEventListener('click', function () { ayarla(!c.classList.contains('acik')); });
    $$('a', c).forEach(function (a) { a.addEventListener('click', function () { ayarla(false); }); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') ayarla(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) ayarla(false); });
  });

  /* --- vitrin okları --- */
  dene('vitrin', function () {
    var s = $('#vitrin');
    if (!s) return;
    $$('[data-kay]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = s.firstElementChild ? s.firstElementChild.getBoundingClientRect().width + 18 : 300;
        s.scrollBy({ left: Number(b.getAttribute('data-kay')) * k, behavior: 'smooth' });
      });
    });
  });

  /* --- kart üretimi (model seçici) --- */
  function kart(m) {
    var oz = [];
    var sp = m.spec || {};
    if (sp['Motor Hacmi']) oz.push(sp['Motor Hacmi'].replace(' cm³', ' cc').replace(/(\d)\.(\d)/, '$1,$2')); else if (sp['Motor Gücü']) oz.push(sp['Motor Gücü']);
    if (sp['Menzil']) oz.push(sp['Menzil'] + ' menzil');
    if (sp['Azami Hız']) oz.push(sp['Azami Hız'].replace('km/h', 'km/s'));
    var ind = m.liste ? Math.round((1 - m.fiyat / m.liste) * 100) : 0;
    var tur = m.ad.replace(m.kod, '').trim();
    return '<a class="kart" href="model-' + m.id + '.html">' +
      '<div class="kart-gorsel">' + (ind ? '<span class="kart-rozet">%' + ind + ' indirim</span>' : '') +
      '<img src="' + m.img[0].replace('.webp', 'k.webp') + '" alt="Volta ' + esc(m.ad) + '" width="560" height="420" loading="lazy" decoding="async"></div>' +
      '<div class="kart-govde"><h3>' + esc(m.kod) + '<small>' + esc(tur) + '</small></h3>' +
      '<div class="kart-oz">' + oz.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
      '<div class="fiyat"><b>' + tl(m.fiyat) + '</b>' + (m.liste ? '<s>' + tl(m.liste) + '</s>' : '') + '</div>' +
      '<div class="kart-alt">İncele <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div></div></a>';
  }

  /* --- model seçici --- */
  dene('sihirbaz', function () {
    var kutu = $('#sonuclar');
    if (!kutu || !window.MODELLER) return;
    var ETIKET = {
      vsm: ['sehir'], vsx: ['sehir'], vs1: ['sehir'], vs2: ['sehir'], 'se-03-max': ['sehir', 'keyif'],
      apm2: ['sehir', 'aile'], apm5: ['sehir'], apt4: ['sehir', 'yuk'],
      rsx4: ['sehir', 'keyif'], rsx5: ['sehir', 'keyif'], rsx7: ['keyif', 'sehir'], rs6: ['sehir'], ps4: ['sehir'],
      apx7: ['keyif', 'sehir'], 'demon-gr250r': ['keyif'], rx5: ['keyif', 'arazi'],
      'vb2-pro': ['sehir'], vb5: ['aile', 'sehir'], vb6: ['sehir'],
      vm2: ['aile'], vt5: ['yuk'], 'vm5-neo': ['aile'], 'vt3-pro': ['sehir'],
      ra5: ['arazi'], vkx5: ['arazi'], vkx3: ['arazi'],
      v1: ['aile', 'sehir'], vmp1: ['yuk'], vg2: ['aile', 'yuk']
    };
    function deger(ad) { var x = $('input[name="' + ad + '"]:checked'); return x ? x.value : ''; }
    function guncelle() {
      var amac = deger('amac'), yakit = deger('yakit'), b = deger('butce').split('-');
      var alt = Number(b[0]), ust = Number(b[1]);
      var l = window.MODELLER.filter(function (m) {
        var et = ETIKET[m.id] || [];
        var benzin = !!(m.spec && m.spec['Motor Hacmi']);
        if (et.indexOf(amac) < 0) return false;
        if (yakit === 'elektrik' && benzin) return false;
        if (yakit === 'benzin' && !benzin) return false;
        return m.fiyat >= alt && m.fiyat <= ust;
      }).sort(function (a, c) {
        var pa = (ETIKET[a.id] || []).indexOf(amac), pc = (ETIKET[c.id] || []).indexOf(amac);
        return pa - pc || a.fiyat - c.fiyat;
      });
      $('#sonuc-sayi').textContent = l.length ? l.length + ' model' : '';
      kutu.innerHTML = l.length
        ? l.slice(0, 6).map(kart).join('') + (l.length > 6 ? '<div class="daha"><a class="dg dg-cizgi-k" href="modeller.html">+' + (l.length - 6) + ' model daha · Tüm modeller</a></div>' : '')
        : '<div class="bos">Bu seçime uyan model yok. Bütçeyi ya da yakıt tercihini değiştirin, ya da <a href="https://wa.me/905519530476?text=' + encodeURIComponent('Merhaba, bana uygun Volta modeli için öneri almak istiyorum.') + '" style="text-decoration:underline;font-weight:700">WhatsApp\'tan bize sorun</a>.</div>';
    }
    $$('#sihirbaz input[type=radio]').forEach(function (r) { r.addEventListener('change', guncelle); });
    guncelle();
  });

  /* --- modeller sayfası: filtre, arama, sıralama --- */
  dene('liste', function () {
    var liste = $('#liste');
    if (!liste) return;
    var kartlar = $$('.kart', liste), sira = kartlar.slice();
    var cipler = $$('.cip[data-kat]'), ara = $('#ara'), sirala = $('#sirala'), sayac = $('#sayac'), bos = $('#liste-bos');
    var kat = 'hepsi';
    var q = (location.search.match(/[?&]kat=([^&]+)/) || [])[1];
    if (q && $('.cip[data-kat="' + decodeURIComponent(q) + '"]')) kat = decodeURIComponent(q);
    function trKucuk(s) { return s.toLocaleLowerCase('tr-TR'); }
    function uygula() {
      cipler.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-kat') === kat ? 'true' : 'false'); });
      var aranan = trKucuk((ara && ara.value || '').trim());
      var d = sirala ? sirala.value : 'varsayilan';
      var dizi = d === 'varsayilan' ? sira.slice() : sira.slice().sort(function (a, b) {
        var fa = Number(a.getAttribute('data-fiyat')), fb = Number(b.getAttribute('data-fiyat'));
        return d === 'artan' ? fa - fb : fb - fa;
      });
      var n = 0;
      dizi.forEach(function (k) {
        var ok = (kat === 'hepsi' || k.getAttribute('data-kat') === kat) && (!aranan || k.getAttribute('data-ad').indexOf(aranan) >= 0);
        k.hidden = !ok; if (ok) n++;
        liste.appendChild(k);
      });
      sayac.textContent = n + ' model gösteriliyor';
      bos.hidden = n > 0;
    }
    cipler.forEach(function (c) { c.addEventListener('click', function () { kat = c.getAttribute('data-kat'); uygula(); }); });
    if (ara) ara.addEventListener('input', uygula);
    if (sirala) sirala.addEventListener('change', uygula);
    var t = $('#temizle');
    if (t) t.addEventListener('click', function () { kat = 'hepsi'; if (ara) ara.value = ''; uygula(); });
    uygula();
    var secili = $('.cip[aria-pressed="true"]');
    if (secili && secili.scrollIntoView && kat !== 'hepsi') secili.parentNode.scrollLeft = secili.offsetLeft - 16;
  });

  /* --- galeri --- */
  dene('galeri', function () {
    var ana = $('#ana-gorsel');
    if (!ana) return;
    var dgler = $$('[data-gorsel]');
    dgler.forEach(function (b) {
      b.addEventListener('click', function () {
        ana.src = b.getAttribute('data-gorsel');
        dgler.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
  });

  /* --- sayfa içi bağlantılar: geçmişe eklemeden kaydır --- */
  dene('capa', function () {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var id = a.getAttribute('href').slice(1);
        var h = id && document.getElementById(id);
        if (!h) return;
        ev.preventDefault();
        var y = h.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  });

  /* --- talep formu --- */
  dene('form', function () {
    $$('form.talep').forEach(function (f) {
      var kutu = f.parentNode, basari = $('.basari', kutu), ozet = $('.ozet', kutu), wa = $('.wa-gonder', kutu);
      var gun = f.elements.gun;
      var bugun = new Date(); bugun.setMinutes(bugun.getMinutes() - bugun.getTimezoneOffset());
      var bugunStr = bugun.toISOString().slice(0, 10);
      if (gun) gun.min = bugunStr;
      function alan(el) { return el.closest('.alan') || el.closest('.onay'); }
      function isaretle(el, hatali) { var a = alan(el); if (a) a.classList.toggle('hata', hatali); if (hatali) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }
      function telTemiz(v) {
        var d = v.replace(/\D/g, '');
        if (d.indexOf('90') === 0 && d.length === 12) d = d.slice(2);
        if (d.charAt(0) === '0') d = d.slice(1);
        return d;
      }
      function kontrol() {
        var ilk = null;
        var ad = f.elements.ad, tel = f.elements.tel, kv = f.elements.kvkk;
        var adOk = ad.value.trim().length >= 3 && /\s/.test(ad.value.trim());
        isaretle(ad, !adOk); if (!adOk) ilk = ilk || ad;
        var t = telTemiz(tel.value), telOk = t.length === 10 && /^[2-5]/.test(t);
        isaretle(tel, !telOk); if (!telOk) ilk = ilk || tel;
        var gunOk = !gun || !gun.value || gun.value >= bugunStr;
        if (gun) { isaretle(gun, !gunOk); if (!gunOk) ilk = ilk || gun; }
        isaretle(kv, !kv.checked); if (!kv.checked) ilk = ilk || kv;
        return ilk;
      }
      ['ad', 'tel', 'gun'].forEach(function (n) {
        var el = f.elements[n]; if (!el) return;
        el.addEventListener('input', function () { if (alan(el).classList.contains('hata')) kontrol(); });
      });
      f.elements.kvkk.addEventListener('change', function () { if (alan(f.elements.kvkk).classList.contains('hata')) kontrol(); });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var ilk = kontrol();
        if (ilk) { ilk.focus({ preventScroll: false }); return; }
        var tur = (f.querySelector('input[name=tur]:checked') || {}).value || 'Bilgi talebi';
        var t = telTemiz(f.elements.tel.value);
        var telYaz = '0' + t.slice(0, 3) + ' ' + t.slice(3, 6) + ' ' + t.slice(6, 8) + ' ' + t.slice(8);
        var satir = ['Talep: ' + tur, 'Ad soyad: ' + f.elements.ad.value.trim(), 'Telefon: ' + telYaz];
        if (f.elements.model.value) satir.push('Model: ' + f.elements.model.value);
        if (gun && gun.value) { var p = gun.value.split('-'); satir.push('Tercih edilen gün: ' + p[2] + '.' + p[1] + '.' + p[0]); }
        if (f.elements.not.value.trim()) satir.push('Not: ' + f.elements.not.value.trim());
        ozet.textContent = satir.join('\n');
        wa.href = 'https://wa.me/' + f.getAttribute('data-wa') + '?text=' + encodeURIComponent('Merhaba, web sitesinden talep oluşturdum.\n\n' + satir.join('\n'));
        f.hidden = true;
        basari.classList.add('acik');
        var y = kutu.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
        try { basari.focus({ preventScroll: true }); } catch (h) { basari.focus(); }
      });
      var yeni = $('.yeni-talep', kutu);
      if (yeni) yeni.addEventListener('click', function () {
        f.reset(); f.hidden = false; basari.classList.remove('acik');
        $$('.hata', f).forEach(function (x) { x.classList.remove('hata'); });
        f.elements.ad.focus();
      });
    });
  });
})();
