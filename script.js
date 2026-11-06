const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = open ? '×' : '☰';
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  menuToggle.textContent = '☰';
}));
document.getElementById('year').textContent = new Date().getFullYear();

const dateInput = document.getElementById('visitDate');
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

document.getElementById('reservationForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('guestName').value.trim();
  const requestType = document.getElementById('requestType').value;
  const date = dateInput.value;
  const time = document.getElementById('visitTime').value;
  const guests = document.getElementById('partySize').value;
  const notes = document.getElementById('notes').value.trim();
  const error = document.getElementById('formError');
  if (!name) {
    error.textContent = 'Please enter your name.';
    return;
  }
  error.textContent = '';
  const lines = [
    'Hello Shanghai Octopus,',
    '',
    `I'd like to: ${requestType.toLowerCase()}.`,
    `Name: ${name}`,
    `Number of guests: ${guests}`,
    date ? `Preferred date: ${date}` : '',
    time ? `Preferred time: ${time}` : '',
    notes ? `Additional details: ${notes}` : '',
    '',
    'Please confirm availability and any relevant details. Thank you.'
  ].filter(Boolean);
  const url = `https://wa.me/2347073542100?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});


const galleryTrack = document.getElementById('galleryTrack');
document.getElementById('galleryPrev').addEventListener('click', () => {
  galleryTrack.scrollBy({ left: -galleryTrack.clientWidth * 0.82, behavior: 'smooth' });
});
document.getElementById('galleryNext').addEventListener('click', () => {
  galleryTrack.scrollBy({ left: galleryTrack.clientWidth * 0.82, behavior: 'smooth' });
});

// Swipe gallery: touch scrolling, mouse drag, progress, and full-screen viewing.
// Remote photo hosts occasionally remove or block an image. Replace failed gallery images
// with a known-good cuisine image so the gallery never leaves an empty frame.
const galleryFallbacks = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1000&q=80'
];
document.querySelectorAll('.gallery-card img').forEach((img, index) => {
  img.addEventListener('error', () => {
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = 'true';
    img.src = galleryFallbacks[index % galleryFallbacks.length];
  });
});

const galleryCards = [...document.querySelectorAll('.gallery-card')];
const galleryProgress = document.getElementById('galleryProgress');
const lightbox = document.getElementById('galleryLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
let activeGalleryIndex = 0;
let dragStartX = 0;
let dragScrollLeft = 0;
let isDragging = false;

function updateGalleryProgress() {
  const max = galleryTrack.scrollWidth - galleryTrack.clientWidth;
  const progress = max > 0 ? galleryTrack.scrollLeft / max : 0;
  galleryProgress.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
}
galleryTrack.addEventListener('scroll', updateGalleryProgress, { passive: true });
window.addEventListener('resize', updateGalleryProgress);
updateGalleryProgress();

// Desktop mouse users can grab and glide the same way they swipe on mobile.
galleryTrack.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.target.closest('button')) return;
  isDragging = true;
  dragStartX = event.clientX;
  dragScrollLeft = galleryTrack.scrollLeft;
  galleryTrack.classList.add('dragging');
});
window.addEventListener('pointermove', event => {
  if (!isDragging) return;
  galleryTrack.scrollLeft = dragScrollLeft - (event.clientX - dragStartX) * 1.15;
});
window.addEventListener('pointerup', () => { isDragging = false; galleryTrack.classList.remove('dragging'); });

function showGalleryImage(index) {
  activeGalleryIndex = (index + galleryCards.length) % galleryCards.length;
  const card = galleryCards[activeGalleryIndex];
  const image = card.querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = card.querySelector('figcaption').textContent.trim();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeGalleryLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
galleryCards.forEach((card, index) => card.querySelector('button').addEventListener('click', () => showGalleryImage(index)));
document.querySelector('.lightbox-close').addEventListener('click', closeGalleryLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => showGalleryImage(activeGalleryIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => showGalleryImage(activeGalleryIndex + 1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeGalleryLightbox(); });
window.addEventListener('keydown', event => {
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeGalleryLightbox();
  if (event.key === 'ArrowLeft') showGalleryImage(activeGalleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryImage(activeGalleryIndex + 1);
});
