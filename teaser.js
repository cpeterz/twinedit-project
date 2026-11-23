const demo = document.querySelector("[data-teaser]");
const media = demo.querySelector("[data-teaser-video]");
const controls = demo.querySelector("[data-teaser-controls]");
const choices = demo.querySelector("[data-teaser-options]");
const buttons = [...choices.querySelectorAll("[data-teaser-object]")];
const toggle = demo.querySelector("[data-teaser-toggle]");
const reference = demo.querySelector("[data-teaser-reference]");
const referenceName = demo.querySelector("[data-teaser-reference-name]");
const status = demo.querySelector("[data-teaser-status]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

// Each source frame is a four-column, two-row grid of synchronized camera feeds.
const columns = 4;
const canvases = [...demo.querySelectorAll("[data-teaser-tile]")];
const { width, height } = canvases[0];
const feeds = canvases.map(canvas => {
  const tile = Number(canvas.dataset.teaserTile);
  return {
    context: canvas.getContext("2d"),
    x: (tile % columns) * width,
    y: Math.floor(tile / columns) * height
  };
});
const frame = document.createElement("canvas");
frame.width = columns * width;
frame.height = 2 * height;
const frameContext = frame.getContext("2d");

let selected = choices.querySelector('[aria-pressed="true"]');
let wantsPlayback = !motionPreference.matches;
let isVisible = false;
let pendingSeek = 0;
let previousFrame = -1;
let animation = 0;

function paintFrame() {
  if (media.readyState < 2 || media.seeking || media.currentTime === previousFrame) return;
  // Sample the video once so every rendered view uses exactly the same decoded frame.
  frameContext.drawImage(media, 0, 0);
  for (const { context, x, y } of feeds) {
    context.drawImage(frame, x, y, width, height, 0, 0, width, height);
  }
  previousFrame = media.currentTime;
}

function animate() {
  animation = 0;
  paintFrame();
  if (!media.paused) animation = requestAnimationFrame(animate);
}

function loadSelection() {
  status.hidden = true;
  media.preload = "auto";
  media.src = `teaser-${selected.dataset.teaserObject}.mp4`;
  media.load();
}

function refreshPlayback() {
  toggle.textContent = wantsPlayback ? "Pause videos" : "Play videos";
  if (!wantsPlayback || !isVisible || document.hidden) {
    media.pause();
    return;
  }
  if (!media.hasAttribute("src") || media.error) loadSelection();
  const source = media.src;
  media.play().catch(error => {
    if (error.name === "AbortError" || media.src !== source) return;
    wantsPlayback = false;
    toggle.textContent = "Play videos";
  });
}

choices.addEventListener("click", event => {
  const choice = event.target.closest("button[data-teaser-object]");
  if (!choice || choice === selected) return;

  if (media.readyState >= 1) pendingSeek = media.currentTime;
  selected.setAttribute("aria-pressed", "false");
  selected = choice;
  selected.setAttribute("aria-pressed", "true");

  const option = buttons.indexOf(selected);
  const finalRow = buttons.length * 2 - 1;
  demo.style.setProperty("--teaser-reference-position", `${100 * option / (buttons.length - 1)}%`);
  demo.style.setProperty("--teaser-before-position", `${100 * (2 * option) / finalRow}%`);
  demo.style.setProperty("--teaser-after-position", `${100 * (2 * option + 1) / finalRow}%`);
  reference.setAttribute("aria-label", selected.textContent);
  referenceName.textContent = selected.textContent;

  previousFrame = -1;
  for (const { context } of feeds) context.clearRect(0, 0, width, height);
  if (media.hasAttribute("src")) loadSelection();
  refreshPlayback();
});

media.addEventListener("loadedmetadata", () => {
  if (pendingSeek > 0) media.currentTime = pendingSeek % media.duration;
  pendingSeek = 0;
});
media.addEventListener("loadeddata", paintFrame);
media.addEventListener("seeked", paintFrame);
media.addEventListener("playing", () => {
  if (!animation) animation = requestAnimationFrame(animate);
});
media.addEventListener("pause", () => {
  cancelAnimationFrame(animation);
  animation = 0;
});
media.addEventListener("error", () => {
  status.hidden = false;
  wantsPlayback = false;
  refreshPlayback();
});

toggle.addEventListener("click", () => {
  wantsPlayback = !wantsPlayback;
  refreshPlayback();
});
motionPreference.addEventListener("change", event => {
  wantsPlayback = !event.matches;
  refreshPlayback();
});
document.addEventListener("visibilitychange", refreshPlayback);

// Start the shared timeline when the interactive section enters the viewport.
const visibility = new IntersectionObserver(([entry]) => {
  isVisible = entry.isIntersecting;
  refreshPlayback();
});
controls.hidden = false;
visibility.observe(demo);
refreshPlayback();
