const isLocalPreview = location.hostname === "127.0.0.1" || location.hostname === "localhost";
const API = isLocalPreview ? "/api/pages" : "https://gonggong.chihpao.chatgpt.site/api/pages";
const entry = document.querySelector("#entry");
const story = document.querySelector("#story");
const form = document.querySelector("#unlock");
const error = document.querySelector("#error");
const progress = document.querySelector("#scroll-progress");
const cursor = document.querySelector("#custom-cursor");

let token = null;
let urls = [];
let generation = 0;
let observer = null;

const escape = (text) => String(text).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);
const lines = (text) => escape(text).replaceAll("\n", "<br>");
const paragraphs = (items) => items.map((text) => `<p>${lines(text)}</p>`).join("");

async function call(method = "GET", asset) {
  const response = await fetch(API + (asset ? `?asset=${asset}` : ""), {
    method,
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    credentials: "omit"
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? "閱讀時間已結束，請重新輸入密碼。" : "暫時無法讀取，請稍後再試。");
  }
  return response;
}

function resetReading() {
  generation += 1;
  token = null;
  observer?.disconnect();
  observer = null;
  story.replaceChildren();
  story.hidden = true;
  entry.hidden = false;
  document.body.classList.remove("reading", "cursor-photo");
  urls.forEach(URL.revokeObjectURL);
  urls = [];
  form.reset();
  progress.style.width = "0";
  window.scrollTo(0, 0);
}

function render(content) {
  story.innerHTML = `
    <nav class="story-nav" id="story-nav" aria-label="閱讀選項">
      <a class="brand-mark" href="#top">${escape(content.recipient)}</a>
      <div class="nav-links" aria-label="章節">
        <a href="#natural">感受</a>
        <a href="#cinema">片刻</a>
        <a href="#night">夜晚</a>
      </div>
      <button id="lock" type="button">關上這片光</button>
    </nav>

    <section class="hero" id="top">
      <div class="hero-copy reveal">
        <p class="eyebrow">一些片刻 ／ 一些關於妳的感覺</p>
        <h1>${lines(content.title)}</h1>
        <p class="intro">${lines(content.intro)}</p>
        <a class="scroll-note" href="#natural">慢慢往下看</a>
      </div>
      <figure class="hero-photo reveal">
        <div class="hero-photo-frame">
          <img data-asset="afternoon" alt="${escape(content.afternoonAlt)}" width="960" height="1280">
          <figcaption class="caption">${escape(content.afternoonCaption)}</figcaption>
        </div>
      </figure>
    </section>

    <section class="chapter natural" id="natural">
      <div class="chapter-inner reveal">
        <p class="section-index">01 ／ 自然</p>
        <h2>${lines(content.naturalTitle)}</h2>
        <p class="body-copy">${lines(content.natural)}</p>
      </div>
    </section>

    <section class="chapter cinema" id="cinema">
      <div class="chapter-inner cinema-grid">
        <div class="reveal">
          <p class="date">${escape(content.cinemaLabel)}</p>
          <h2>${lines(content.cinemaTitle)}</h2>
          <p class="small-note">${escape(content.film)}</p>
        </div>
        <div class="fragments reveal">${paragraphs(content.cinema)}</div>
      </div>
    </section>

    <section class="chapter animals">
      <div class="chapter-inner animals-grid">
        <div class="animals-copy reveal">
          <p class="date">${escape(content.animalsLabel)}</p>
          <h2>${lines(content.animalsTitle)}</h2>
          ${paragraphs(content.animals)}
        </div>
        <figure class="animals-art reveal">
          <img data-asset="animals" alt="${escape(content.animalsAlt)}" width="1200" height="800" loading="lazy">
        </figure>
      </div>
    </section>

    <section class="sharing">
      <div class="sharing-inner reveal">
        <p class="section-index">02 ／ 分享</p>
        <p>${lines(content.sharing)}</p>
      </div>
    </section>

    <section class="sunset">
      <figure class="photo-bleed reveal">
        <img data-asset="sunset" alt="${escape(content.sunsetAlt)}" width="1477" height="1108" loading="lazy">
      </figure>
      <div class="sunset-copy">
        <div class="chapter-inner">
          <div class="reveal">
            <p class="section-index">03 ／ ${escape(content.sunsetLabel)}</p>
            <h2>${lines(content.sunsetTitle)}</h2>
          </div>
          <p class="body-copy reveal">${lines(content.sunset)}</p>
        </div>
      </div>
    </section>

    <section class="night" id="night">
      <div class="night-copy reveal">
        <p class="section-index">同一天 ／ 新月升起以後</p>
        ${paragraphs(content.night)}
        <p class="caption">${escape(content.nightCaption)}</p>
      </div>
      <figure class="night-photo reveal">
        <img data-asset="night" alt="${escape(content.nightAlt)}" width="1280" height="720" loading="lazy">
      </figure>
    </section>

    <button class="back-top is-hidden" id="back-top" type="button" aria-label="回到頂部">↑</button>`;

  document.querySelector("#lock").addEventListener("click", async () => {
    try { await call("DELETE"); } catch {}
    resetReading();
  });
  document.querySelector("#back-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  setupReveal();
  setupPhotoCursor();
  updateScrollUI();
}

function setupReveal() {
  const elements = [...story.querySelectorAll(".reveal")];
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("show"));
    return;
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -6%" });
  elements.forEach((element) => observer.observe(element));
}

function setupPhotoCursor() {
  story.querySelectorAll("figure").forEach((figure) => {
    figure.addEventListener("pointerenter", () => document.body.classList.add("cursor-photo"));
    figure.addEventListener("pointerleave", () => document.body.classList.remove("cursor-photo"));
  });
}

function updateScrollUI() {
  if (!document.body.classList.contains("reading")) {
    progress.style.width = "0";
    return;
  }
  const available = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  progress.style.width = `${Math.min(100, Math.max(0, scrollY / available * 100))}%`;
  document.querySelector("#story-nav")?.classList.toggle("scrolled", scrollY > 24);
  document.querySelector("#back-top")?.classList.toggle("is-hidden", scrollY < innerHeight * .75);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  const original = button.innerHTML;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.innerHTML = "<span>開啟中</span><span aria-hidden=\"true\">…</span>";
  error.textContent = "";
  let password = form.password.value;
  try {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "omit",
      cache: "no-store"
    });
    password = "";
    form.password.value = "";
    if (!response.ok) {
      throw new Error(response.status === 429 ? "先休息一下，十五分鐘後再試。" : response.status === 401 ? "密碼不太對，再試一次。" : "暫時無法開啟，請稍後再試。");
    }
    token = (await response.json()).token;
    const content = await (await call()).json();
    render(content);
    const current = ++generation;
    await Promise.all([...story.querySelectorAll("[data-asset]")].map(async (image) => {
      const blob = await (await call("GET", image.dataset.asset)).blob();
      if (current !== generation) return;
      const url = URL.createObjectURL(blob);
      urls.push(url);
      image.src = url;
    }));
    entry.hidden = true;
    story.hidden = false;
    document.body.classList.add("reading");
    const title = document.querySelector("#top h1");
    title.setAttribute("tabindex", "-1");
    title.focus();
    window.scrollTo(0, 0);
    requestAnimationFrame(updateScrollUI);
  } catch (caught) {
    resetReading();
    error.textContent = caught.message || "連線暫時中斷，請再試一次。";
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.innerHTML = original;
  }
});

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);
window.addEventListener("pointermove", (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
}, { passive: true });
document.addEventListener("pointerover", (event) => {
  document.body.classList.toggle("cursor-active", Boolean(event.target.closest("a,button,input")));
});
window.addEventListener("pagehide", () => {
  if (token) fetch(API, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "omit", keepalive: true }).catch(() => {});
  resetReading();
});
