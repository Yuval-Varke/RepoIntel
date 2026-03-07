export function initScoreRings() {
    const rings = document.querySelectorAll('.score-ring-progress');

    // Animate ring fill with delay
    setTimeout(() => {
        rings.forEach(progressCircle => {
            const targetOffset = parseFloat(progressCircle.dataset.target);
            if (!isNaN(targetOffset)) {
                progressCircle.style.strokeDashoffset = targetOffset;
            }
        });
    }, 400);

    // Animate number count-up
    document.querySelectorAll('[data-count-to]').forEach(el => {
        const target = parseInt(el.dataset.countTo, 10);
        if (isNaN(target)) return;

        const duration = 1200;
        const startTime = performance.now();

        el.textContent = '0';

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        // Start after a small delay
        setTimeout(() => requestAnimationFrame(update), 400);
    });

    // Animate sub-score bars with stagger
    document.querySelectorAll('.score-bar-fill').forEach((bar, i) => {
        const targetWidth = bar.dataset.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
        }, 600 + i * 150);
    });
}
