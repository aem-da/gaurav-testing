const AUTOPLAY_INTERVAL = 6000;

function isVideoSource(src = '') {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(src);
}

function buildMedia(mediaCell) {
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-media';

  if (!mediaCell) return wrapper;

  const picture = mediaCell.querySelector('picture');

  if (picture) {
    wrapper.append(picture);
    return wrapper;
  }

  const link = mediaCell.querySelector('a');
  const src = link ? link.href : mediaCell.textContent.trim();

  if (!src) return wrapper;

  if (isVideoSource(src)) {
    const video = document.createElement('video');
    video.src = src;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    wrapper.append(video);
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';

    wrapper.append(img);
  }

  return wrapper;
}

function buildSlide(row, index) {
  const cells = [...row.children];

  const [
    mediaCell,
    eyebrowCell,
    titleCell,
    descCell,
    ctaCell,
  ] = cells;

  const slide = document.createElement('div');
  slide.className = 'hero-slide';
  slide.dataset.index = index;

  const media = buildMedia(mediaCell);
  slide.append(media);

  const overlay = document.createElement('div');
  overlay.className = 'hero-overlay';

  const content = document.createElement('div');
  content.className = 'hero-content';

  // Eyebrow
  if (eyebrowCell?.textContent.trim()) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'hero-eyebrow';
    eyebrow.textContent = eyebrowCell.textContent.trim();

    content.append(eyebrow);
  }

  // Title
  if (titleCell?.textContent.trim()) {
    const title = document.createElement('h1');
    title.className = 'hero-title';
    title.innerHTML = titleCell.innerHTML;

    content.append(title);
  }

  // Description
  if (descCell?.textContent.trim()) {
    const desc = document.createElement('p');
    desc.className = 'hero-description';
    desc.innerHTML = descCell.innerHTML;

    content.append(desc);
  }

  // CTA
  const link = ctaCell?.querySelector('a');

  if (link) {
    link.classList.add('hero-cta');

    const arrow = document.createElement('span');
    arrow.className = 'hero-cta-arrow';

    link.append(arrow);

    content.append(link);
  }

  overlay.append(content);
  slide.append(overlay);

  return slide;
}

function buildPagination(count) {
  const pagination = document.createElement('div');
  pagination.className = 'hero-pagination';

  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('button');

    dot.className = 'hero-dot';
    dot.dataset.index = i;

    pagination.append(dot);
  }

  return pagination;
}

function setActive(track, pagination, index) {
  const slides = [...track.children];
  const dots = [...pagination.children];

  slides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === index);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === index);
  });
}

export default function decorate(block) {
  const rows = [...block.children];

  block.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.className = 'hero-viewport';

  const track = document.createElement('div');
  track.className = 'hero-track';

  rows.forEach((row, index) => {
    track.append(buildSlide(row, index));
  });

  const pagination = buildPagination(rows.length);

  viewport.append(track);
  viewport.append(pagination);

  block.append(viewport);

  let current = 0;
  let timer;

  function goTo(index) {
    current = (index + rows.length) % rows.length;
    setActive(track, pagination, current);
  }

  function start() {
    stop();

    if (rows.length <= 1) return;

    timer = setInterval(() => {
      goTo(current + 1);
    }, AUTOPLAY_INTERVAL);
  }

  function stop() {
    clearInterval(timer);
  }

  pagination.addEventListener('click', (e) => {
    const dot = e.target.closest('.hero-dot');

    if (!dot) return;

    goTo(parseInt(dot.dataset.index, 10));

    start();
  });

  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);

  goTo(0);
  start();
}
