export function initScoreRings() {
    const rings = document.querySelectorAll('.score-ring-progress');

    // Animate with a small delay for visual effect
    setTimeout(() => {
        rings.forEach(progressCircle => {
            // The new dataset key used in dashboard is data-target
            const targetOffset = parseFloat(progressCircle.dataset.target);
            if (!isNaN(targetOffset)) {
                progressCircle.style.strokeDashoffset = targetOffset;
            }
        });
    }, 300);
}
