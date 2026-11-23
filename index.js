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

