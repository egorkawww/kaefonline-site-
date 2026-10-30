// KaefOnline site: reveal on scroll, copy the address, live server status, tilt on the server card.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // header background after scrolling
  const top = $(".top");
  const onScroll = () => top.classList.toggle("scrolled", scrollY > 20);
  onScroll(); addEventListener("scroll", onScroll, { passive: true });

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".rv").forEach(el => io.observe(el));

  // copy address
  const toast = $("[data-toast]");
  let toastTimer;
  const copy = async btn => {
    const text = btn.dataset.copy;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    btn.classList.add("copied");
    const label = $("[data-copy-text]", btn);
    const old = label && label.textContent;
    if (label) label.textContent = "Скопировано";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show"); btn.classList.remove("copied");
      if (label) label.textContent = old;
    }, 1800);
  };
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => copy(b)));

  // live status (mcsrvstat.us caches ~1 min; the proxy reports max = online + 1, so only online is shown)
  const dot = $("[data-status-dot]"), line = $("[data-status-line]");
  const players = $("[data-players]"), bars = $("[data-bars]"), big = $("[data-online-big]");
  const word = n => (n % 10 === 1 && n % 100 !== 11) ? "игрок" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? "игрока" : "игроков";
  const setOffline = () => {
    dot.className = "dot off";
    line.textContent = "Сеть сейчас спит — время запуска в Telegram";
    players.textContent = "офлайн"; bars.className = "bars off"; big.textContent = "0";
  };
  const load = async () => {
    try {
      const r = await fetch("https://api.mcsrvstat.us/3/kaef.online", { cache: "no-store" });
      const d = await r.json();
      if (!d.online) return setOffline();
      const n = (d.players && d.players.online) || 0;
      dot.className = "dot on";
      line.textContent = n ? `Сервер онлайн · ${n} ${word(n)} в игре` : "Сервер онлайн · заходи первым";
      players.textContent = `${n}`; bars.className = "bars on"; big.textContent = n;
    } catch { line.textContent = "Адрес: kaef.online"; }
  };
  if (dot) { load(); setInterval(load, 60000); }

  // tilt
  const card = $("[data-tilt]");
  if (card && matchMedia("(hover:hover) and (prefers-reduced-motion:no-preference)").matches) {
    const stage = card.parentElement;
    stage.addEventListener("pointermove", e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateX(-50%) perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    stage.addEventListener("pointerleave", () => { card.style.transform = ""; });
  }

  // a mode card with a "more" link opens it on a click anywhere in the card
  $$(".mode").forEach(card => {
    const more = $(".mode-more", card);
    if (!more) return;
    card.addEventListener("click", e => { if (!e.target.closest("a")) location.href = more.href; });
  });

  // one open FAQ at a time
  $$(".qa details").forEach(d => d.addEventListener("toggle", () => {
    if (d.open) $$(".qa details").forEach(o => o !== d && (o.open = false));
  }));
})();
