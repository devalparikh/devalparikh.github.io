/** A short blur-to-sharp wave shared by page titles and changing note paths. */
export function animateLetters(letters: HTMLElement[], delay = 0) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches || !letters.length) return;

  const easing = getComputedStyle(letters[0]).getPropertyValue("--ease-out-quint").trim();
  // Cap the wave so a long title or path never extends the entrance.
  const stagger = Math.min(12, 180 / Math.max(1, letters.length - 1));
  const animations = letters.map((letter, index) => letter.animate([
    { opacity: 0, filter: "blur(3px)", transform: "translateY(.18em)" },
    { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
  ], { duration: 320, delay: delay + index * stagger, easing, fill: "backwards" }));

  const cancel = () => animations.forEach((animation) => animation.cancel());
  preference.addEventListener("change", cancel);
  return () => { cancel(); preference.removeEventListener("change", cancel); };
}
