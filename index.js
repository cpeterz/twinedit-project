const comparison = document.querySelector("[data-slider]");
const split = comparison.querySelector("input");

function updateSplit() {
  const original = Number(split.value);
  comparison.style.setProperty("--split", original + "%");
  split.setAttribute("aria-valuetext", original + "% original, " + (100 - original) + "% TwinEdit");
}

split.addEventListener("input", updateSplit);
updateSplit();

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const loopToggle = document.querySelector("[data-loop-toggle]");
const loopVideos = [...document.querySelectorAll("[data-loop]")];
const visibleVideos = new Set();
let loopsEnabled = !motionPreference.matches;

function updateLoops() {
  loopToggle.textContent = loopsEnabled ? "Pause loops" : "Play loops";

  for (const video of loopVideos) {
    if (loopsEnabled && !document.hidden && visibleVideos.has(video)) {
      video.play().catch(() => {
        // Manual controls remain available when autoplay is blocked.
        if (loopsEnabled) video.controls = true;
      });
    } else {
      video.pause();
    }
  }
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleVideos.add(entry.target);
      else visibleVideos.delete(entry.target);
    }
    updateLoops();
  }, { threshold: 0.25 });
  loopVideos.forEach(video => observer.observe(video));
} else {
  loopVideos.forEach(video => visibleVideos.add(video));
}

loopToggle.hidden = false;
loopToggle.addEventListener("click", () => {
  loopsEnabled = !loopsEnabled;
  updateLoops();
});
motionPreference.addEventListener("change", () => {
  loopsEnabled = !motionPreference.matches;
  updateLoops();
});
document.addEventListener("visibilitychange", updateLoops);
updateLoops();

const comparisonOptions = document.querySelector("[data-comparison-options]");
const comparisonPlayer = document.querySelector("[data-comparison-player]");
const comparisonSource = comparisonPlayer.querySelector("source");
const comparisonCaption = document.getElementById("comparison-caption");
const captions = {
  correction: "Replace the toy block with a correction tape dispenser.",
  potato: "Replace the power adapter with a sweet potato.",
  eraser: "Replace the tape roll with an eraser.",
  cap: "Replace the cylinder with a white baseball cap.",
  usb: "Replace the ring with a USB drive."
};

comparisonOptions.hidden = false;
comparisonOptions.addEventListener("click", event => {
  const selection = event.target.closest("button[data-example]");
  if (!selection || selection.getAttribute("aria-pressed") === "true") return;

  const current = comparisonOptions.querySelector('[aria-pressed="true"]');
  const wasPlaying = !comparisonPlayer.paused;
  const key = selection.dataset.example;
  current.setAttribute("aria-pressed", "false");
  selection.setAttribute("aria-pressed", "true");

  comparisonPlayer.poster = "compare-" + key + ".webp";
  comparisonSource.src = "compare-" + key + ".mp4";
  comparisonCaption.textContent = captions[key];
  comparisonPlayer.load();

  if (wasPlaying) comparisonPlayer.play().catch(() => {
    // The video can still be played using its native controls.
  });
});

