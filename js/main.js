// Overlay Navigation Toggle
document.querySelectorAll('#overlay-nav ul li a').forEach(link =>
  link.addEventListener('click', () => (document.getElementById('nav-toggle').checked = false))
);

// Slider Initialization
document.querySelectorAll('.slider').forEach(slider => {
  const track = slider.querySelector('.slider_track');
  const slides = Array.from(track.children);
  const [prevBtn, nextBtn] = [
    slider.querySelector('._previous_arrow'),
    slider.querySelector('._next_arrow')
  ];
  let currentIndex = 0, isDragging = false, startX = 0, currentTranslate = 0, prevTranslate = 0, animationID = 0, sliderEnabled = true;

  const getSlideWidth = () => {
    const s = slides[0], st = window.getComputedStyle(s);
    return s.getBoundingClientRect().width + parseFloat(st.marginLeft) + parseFloat(st.marginRight);
  };
  const getVisibleCount = () => Math.max(1, Math.floor(slider.offsetWidth / getSlideWidth()));
  const getMaxIndex = () => Math.max(0, slides.length - getVisibleCount());
  const isSliderStatic = () =>
    slides.reduce((sum, s) => {
      const st = window.getComputedStyle(s);
      return sum + s.getBoundingClientRect().width + parseFloat(st.marginLeft) + parseFloat(st.marginRight);
    }, 0) <= slider.offsetWidth;

  function setPosition(animate = false) {
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(.77,0,.18,1)' : 'none';
    track.style.transform = `translateX(-${Math.round(getSlideWidth() * currentIndex)}px)`;
  }

  function moveTo(index) {
    const max = getMaxIndex();
    if (index < 0) currentIndex = 0;
    else if (index > max) {
      currentIndex = max;
      setPosition(true);
      setTimeout(() => { currentIndex = 0; setPosition(true); }, 500);
      return;
    } else currentIndex = index;
    setPosition(true);
  }

  function dragStart(e) {
    if (!sliderEnabled) return;
    isDragging = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    prevTranslate = -getSlideWidth() * currentIndex;
    animationID = requestAnimationFrame(animation);
    track.style.transition = 'none';
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchmove', dragMove, { passive: false });
    window.addEventListener('touchend', dragEnd);
  }
  function dragMove(e) {
    if (!isDragging) return;
    const pos = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    currentTranslate = prevTranslate + (pos - startX);
  }
  function dragEnd() {
    cancelAnimationFrame(animationID);
    if (!isDragging) return;
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate, w = getSlideWidth(), max = getMaxIndex();
    if (movedBy < -w / 4) {
      if (currentIndex >= max) {
        currentIndex = max; setPosition(true);
        setTimeout(() => { currentIndex = 0; setPosition(true); }, 500);
      } else moveTo(currentIndex + 1);
    } else if (movedBy > w / 4) {
      if (currentIndex === 0) {
        setPosition(true);
        setTimeout(() => { currentIndex = max; setPosition(true); }, 500);
      } else moveTo(currentIndex - 1);
    } else setPosition(true);
    window.removeEventListener('mousemove', dragMove);
    window.removeEventListener('mouseup', dragEnd);
    window.removeEventListener('touchmove', dragMove);
    window.removeEventListener('touchend', dragEnd);
  }
  function animation() {
    if (isDragging) {
      track.style.transform = `translateX(${Math.round(currentTranslate)}px)`;
      requestAnimationFrame(animation);
    }
  }

  function setSliderMode() {
    const arrows = slider.querySelector('.slider_arrows');
    if (isSliderStatic()) {
      sliderEnabled = false;
      if (arrows) arrows.style.display = 'none';
      track.style.transition = 'none';
      track.style.transform = 'none';
      currentIndex = 0;
    } else {
      sliderEnabled = true;
      if (arrows) arrows.style.display = '';
      currentIndex = 0;
      setPosition();
    }
  }

  [nextBtn, prevBtn].forEach((btn, i) =>
    btn && btn.addEventListener('click', () => sliderEnabled && moveTo(currentIndex + (i ? -1 : 1)))
  );
  track.addEventListener('mousedown', dragStart);
  track.addEventListener('touchstart', dragStart, { passive: false });
  window.addEventListener('resize', setSliderMode);
  setSliderMode();
});