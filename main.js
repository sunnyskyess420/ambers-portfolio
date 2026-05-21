// SunnySkyesS Portfolio Main JavaScript

var FORMSPREE_ID = 'xwvwqdjq';

function showToast(msg, isError) {
  var toast = document.getElementById('toast');
  var icon = toast.querySelector('.toast-icon');
  var text = toast.querySelector('.toast-msg');
  text.textContent = msg;
  icon.setAttribute('data-icon', isError ? 'lucide:alert-circle' : 'lucide:check-circle');
  icon.style.color = isError ? '#8b3a2c' : '#c9923b';
  toast.style.borderColor = isError ? 'rgba(139,58,44,0.3)' : 'rgba(201,146,59,0.2)';
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3500);
}

// Real-time validation
var formName = document.getElementById('formName');
var formEmail = document.getElementById('formEmail');
var formMessage = document.getElementById('formMessage');
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName() {
  var isValid = formName.value.trim().length >= 2;
  document.getElementById('nameValid').style.opacity = isValid ? '1' : '0';
  return isValid;
}

function validateEmail() {
  var isValid = emailRegex.test(formEmail.value);
  document.getElementById('emailValid').style.opacity = isValid ? '1' : '0';
  document.getElementById('emailError').style.opacity = (!isValid && formEmail.value) ? '1' : '0';
  return isValid;
}

function updateMessageCount() {
  var count = formMessage.value.length;
  document.getElementById('msgCount').textContent = count;
  document.getElementById('msgCount').style.color = count >= 10 ? '#c9923b' : 'rgba(255,255,255,0.4)';
}

formName.addEventListener('blur', validateName);
formName.addEventListener('input', validateName);
formEmail.addEventListener('blur', validateEmail);
formEmail.addEventListener('input', validateEmail);
formMessage.addEventListener('input', updateMessageCount);

document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Honeypot check — if filled, silently reject (bot caught)
  if (document.querySelector('input[name="website"]').value) {
    console.log('Honeypot triggered — likely spam');
    showToast('Message sent!', false); // Fake success to fool bots
    return;
  }

  // Validate before submit
  if (!validateName() || !validateEmail() || formMessage.value.length < 10) {
    showToast('Please fill all fields correctly', true);
    return;
  }

  var btn = document.getElementById('submitBtn');
  var origText = btn.textContent;

  btn.textContent = 'SENDING...';
  btn.disabled = true;
  btn.style.opacity = '0.6';

  var form = this;
  var data = new FormData(form);

  fetch('https://formspree.io/f/' + FORMSPREE_ID, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  }).then(function(response) {
    if (response.ok) {
      showToast('Signal sent! I\'ll get back to you soon ☀️', false);
      form.reset();
      document.getElementById('nameValid').style.opacity = '0';
      document.getElementById('emailValid').style.opacity = '0';
      document.getElementById('msgCount').textContent = '0';
    } else {
      return response.json().then(function(err) {
        throw new Error(err.error || 'Something went wrong');
      });
    }
  }).catch(function(err) {
    showToast('Failed to send — ' + err.message, true);
  }).finally(function() {
    btn.textContent = origText;
    btn.disabled = false;
    btn.style.opacity = '1';
  });
});

var PER_PAGE = 24;
var allImages = (typeof GALLERY_IMAGES !== 'undefined' && Array.isArray(GALLERY_IMAGES)) ? GALLERY_IMAGES : [];
console.log('Gallery loaded:', allImages.length, 'images');
allImages = allImages.filter(function(i) { return i.category !== 'jb-sketches'; });
var filteredImages = [];
var visibleCount = PER_PAGE;
var currentCategory = 'my-creations';

function getFiltered(cat) {
  return cat === 'all' ? allImages : allImages.filter(function(i) { return i.category === cat; });
}

function updateCounts() {
  document.getElementById('countAll').textContent = '(' + allImages.length + ')';
  document.getElementById('countAiArt').textContent = '(' + allImages.filter(function(i) { return i.category === 'ai-art'; }).length + ')';
  document.getElementById('countArtwork').textContent = '(' + allImages.filter(function(i) { return i.category === 'artwork'; }).length + ')';
  document.getElementById('countMyCreations').textContent = '(' + allImages.filter(function(i) { return i.category === 'my-creations'; }).length + ')';
  document.getElementById('countPhotography').textContent = '(' + allImages.filter(function(i) { return i.category === 'photography'; }).length + ')';
}

function filterCat(cat) {
  currentCategory = cat;
  visibleCount = PER_PAGE;
  filteredImages = getFiltered(cat);
  document.querySelectorAll('.cat-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.cat === cat); });
  renderGallery();
  window.scrollTo({ top: document.getElementById('work').offsetTop - 80, behavior: 'smooth' });
}

var failedImages = [];
function handleImageError(img, imgData) {
  console.warn('Failed to load image:', imgData.id, imgData.src);
  failedImages.push({ id: imgData.id, src: imgData.src, time: new Date().toISOString() });
  img.parentElement.parentElement.remove();
  if (failedImages.length > 10) {
    console.error('Multiple image failures detected. Imgur may be blocking requests.');
  }
}

var ROWS = 3;

function scrollMarqueeRow(row, amount) {
  var track = document.getElementById('marquee-track-' + row);
  if (!track) return;
  
  // Pause animation while scrolling
  track.style.animationPlayState = 'paused';
  
  // Get current transform value
  var style = window.getComputedStyle(track);
  var matrix = new WebKitCSSMatrix(style.transform);
  var currentX = matrix.m41;
  
  // Apply new transform
  var newX = currentX + amount;
  track.style.transform = 'translateX(' + newX + 'px)';
  track.classList.remove('marquee-left', 'marquee-right');
  
  // Resume animation after 3 seconds of inactivity
  clearTimeout(track.resumeTimeout);
  track.resumeTimeout = setTimeout(function() {
    track.style.transform = '';
    var direction = row % 2 === 0 ? 'marquee-left' : 'marquee-right';
    track.classList.add(direction);
    track.style.animationPlayState = 'running';
  }, 3000);
}

function renderGallery() {
  var container = document.getElementById('marqueeGallery');
  console.log('renderGallery called, container:', container, 'filteredImages:', filteredImages.length);
  if (!container) { console.error('marqueeGallery container not found'); return; }
  if (!filteredImages.length) { console.error('No filtered images'); return; }
  
  var totalImages = filteredImages.length;
  var perRow = Math.ceil(totalImages / ROWS);
  
  var html = '';
  for (var row = 0; row < ROWS; row++) {
    var startIdx = row * perRow;
    var rowImages = filteredImages.slice(startIdx, startIdx + perRow);
    
    // Duplicate images for seamless loop
    var duplicatedImages = rowImages.concat(rowImages);
    
    var direction = row % 2 === 0 ? 'left' : 'right';
    var animationClass = direction === 'left' ? 'marquee-left' : 'marquee-right';
    
    html += '<div class="marquee-row" data-row="' + row + '">' +
      '<button class="marquee-nav prev" onclick="scrollMarqueeRow(' + row + ', -300)" aria-label="Scroll left">' +
        '<span class="iconify" data-icon="lucide:chevron-left" data-width="20"></span>' +
      '</button>' +
      '<button class="marquee-nav next" onclick="scrollMarqueeRow(' + row + ', 300)" aria-label="Scroll right">' +
        '<span class="iconify" data-icon="lucide:chevron-right" data-width="20"></span>' +
      '</button>' +
      '<div class="marquee-track ' + animationClass + '" id="marquee-track-' + row + '">' +
        duplicatedImages.map(function(img, i) {
          var actualIdx = startIdx + (i % rowImages.length);
          var altText = img.alt || (img.label + ' artwork');
          return '<div class="marquee-item" onclick="openLB(' + actualIdx + ')">' +
            '<img src="' + img.src + '" alt="' + altText + '" loading="lazy" onload="this.classList.add(\'loaded\')" onerror="handleImageError(this, {id: \'' + img.id + '\', src: \'' + img.src + '\'})">' +
            '<div class="item-overlay">' +
              '<span class="text-[8px] tracking-[0.15em] uppercase font-medium" style="color: rgba(201,146,59,0.85);">' + img.label + '</span>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }
  
  container.innerHTML = html;
  container.classList.remove('hidden');
  console.log('Gallery HTML generated:', html.length, 'chars, rows:', ROWS);
  
  // Force images to show after a short delay
  setTimeout(function() {
    document.querySelectorAll('.marquee-item img').forEach(function(img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      }
    });
  }, 500);
  
  // Add manual scroll hint
  var hint = document.createElement('div');
  hint.className = 'text-center mt-4 text-[10px] text-white/40';
  hint.innerHTML = '<span class="iconify inline-block mr-1" data-icon="lucide:mouse" data-width="12"></span> Hover & scroll horizontally to browse manually';
  container.appendChild(hint);
  
  // Enable smooth manual scrolling on each row
  document.querySelectorAll('.marquee-row').forEach(function(row) {
    var track = row.querySelector('.marquee-track');
    var isDown = false;
    var startX;
    var scrollLeft;
    
    row.addEventListener('mousedown', function(e) {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    
    row.addEventListener('mouseleave', function() {
      isDown = false;
    });
    
    row.addEventListener('mouseup', function() {
      isDown = false;
    });
    
    row.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;
    });
  });
  
  document.getElementById('showingCount').textContent = totalImages === 0 ? 'Nothing in this chest' : 'Showing ' + totalImages + ' creations in 3 scrolling rows';
  document.getElementById('emptyState').classList.toggle('hidden', totalImages > 0);
}

function loadMore() {
  // For marquee, all images are shown at once
  renderGallery();
}

var lbCur = 0;
function openLB(i) { lbCur = i; updLB(); document.getElementById('lightbox').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeLB() { document.getElementById('lightbox').classList.remove('active'); document.body.style.overflow = ''; }
function prevLB() { lbCur = (lbCur - 1 + filteredImages.length) % filteredImages.length; updLB(); }
function nextLB() { lbCur = (lbCur + 1) % filteredImages.length; updLB(); }
function copyLBLink() {
  var img = filteredImages[lbCur];
  if (!img) return;
  var link = img.fullSrc || img.src;
  navigator.clipboard.writeText(link).then(function() {
    showToast('Link copied to clipboard', false);
  }).catch(function() {
    showToast('Failed to copy link', true);
  });
}
function downloadLB() {
  var img = filteredImages[lbCur];
  if (!img) return;
  var src = img.fullSrc || img.src;
  if (src && !src.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    src += '.jpg';
  }
  var a = document.createElement('a');
  a.href = src;
  a.download = img.id + '_' + (img.label || 'image').replace(/\s+/g, '_').toLowerCase() + '.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Download started', false);
}
function updLB() {
  var img = filteredImages[lbCur];
  if (!img) return;
  var src = img.fullSrc || img.src;
  if (src && !src.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    src += '.jpg';
  }
  var lbImg = document.getElementById('lbImg');
  lbImg.src = src;
  lbImg.classList.remove('zoomed');
  lbImg.style.transform = '';
  lbImg.classList.remove('cursor-zoom-out');
  lbImg.classList.add('cursor-zoom-in');
  document.getElementById('lbCat').textContent = img.label;
  document.getElementById('lbCounter').textContent = (lbCur + 1) + ' / ' + filteredImages.length;
}

var lbZoomed = false;
function toggleZoom() {
  var lbImg = document.getElementById('lbImg');
  lbZoomed = !lbZoomed;
  if (lbZoomed) {
    lbImg.classList.add('zoomed');
    lbImg.style.transform = 'scale(1.8)';
    lbImg.classList.remove('cursor-zoom-in');
    lbImg.classList.add('cursor-zoom-out');
    // Allow panning by making image draggable
    lbImg.style.cursor = 'grab';
  } else {
    lbImg.classList.remove('zoomed');
    lbImg.style.transform = '';
    lbImg.classList.remove('cursor-zoom-out');
    lbImg.classList.add('cursor-zoom-in');
    lbImg.style.cursor = 'zoom-in';
  }
}
document.addEventListener('keydown', function(e) {
  if (!document.getElementById('lightbox').classList.contains('active')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') prevLB();
  if (e.key === 'ArrowRight') nextLB();
});
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === document.getElementById('lightbox')) closeLB();
});

var glow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', function(e) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

var mt = document.getElementById('menuToggle');
var mm = document.getElementById('mobileMenu');
var mo = false;
mt.addEventListener('click', function() {
  mo = !mo;
  mm.classList.toggle('open', mo);
  document.getElementById('l1').style.transform = mo ? 'rotate(45deg) translate(3px,3px)' : '';
  document.getElementById('l2').style.opacity = mo ? '0' : '1';
  document.getElementById('l3').style.transform = mo ? 'rotate(-45deg) translate(3px,-3px)' : '';
  document.body.style.overflow = mo ? 'hidden' : '';
});
document.querySelectorAll('.mlink').forEach(function(l) { l.addEventListener('click', function() {
  mo = false; mm.classList.remove('open');
  document.getElementById('l1').style.transform = '';
  document.getElementById('l2').style.opacity = '1';
  document.getElementById('l3').style.transform = '';
  document.body.style.overflow = '';
}); });

var ro = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      setTimeout(function() { e.target.classList.add('revealed'); }, 0);
      ro.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.scroll-reveal').forEach(function(el) { ro.observe(el); });

try {
  if (allImages.length > 0) {
    console.log('Initializing gallery with', allImages.length, 'images');
    updateCounts();
    filteredImages = getFiltered('my-creations');
    console.log('Filtered images:', filteredImages.length);
    renderGallery();
    console.log('Gallery rendered successfully - horizontal scroll active');
  } else {
    console.error('No images found - gallery.js may not be loading');
    document.getElementById('noDataState').classList.remove('hidden');
  }
} catch (err) {
  console.error('Gallery initialization error:', err);
  document.getElementById('noDataState').classList.remove('hidden');
}

// Visitor Counter - tracks unique sessions via localStorage
(function() {
  var VISITOR_KEY = 'sunnyskyess_visitor_count';
  var SESSION_KEY = 'sunnyskyess_session';
  var count = parseInt(localStorage.getItem(VISITOR_KEY) || '0', 10);
  var hasSession = sessionStorage.getItem(SESSION_KEY);
  if (!hasSession) {
    count++;
    localStorage.setItem(VISITOR_KEY, count.toString());
    sessionStorage.setItem(SESSION_KEY, 'true');
  }
  document.getElementById('visitorCount').textContent = count.toLocaleString();
})();

// Performance Metrics
(function() {
  window.addEventListener('load', function() {
    setTimeout(function() {
      var timing = performance.timing;
      var loadTime = timing.loadEventEnd - timing.navigationStart;
      var domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      console.log('Page load time: ' + loadTime + 'ms');
      console.log('DOM ready time: ' + domReady + 'ms');
    }, 0);
  });
})();
