// Marquee Gallery - 3 rows with alternating scroll directions
(function() {
  var ROWS = 3;
  var IMAGES_PER_ROW = 16; // Images visible at once per row
  
  function renderMarqueeGallery() {
    var container = document.getElementById('marqueeGallery');
    if (!container || !filteredImages.length) return;
    
    // Calculate images per row
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
      
      html += '<div class="marquee-row">' +
        '<div class="marquee-track ' + animationClass + '">' +
          duplicatedImages.map(function(img, i) {
            var actualIdx = startIdx + (i % rowImages.length);
            var altText = img.alt || (img.label + ' artwork');
            return '<div class="marquee-item" onclick="openLB(' + actualIdx + ')">' +
              '<img src="' + img.src + '" alt="' + altText + '" loading="lazy" onload="this.classList.add(\'loaded\')">' +
              '<div class="item-overlay">' +
                '<span class="text-[8px] tracking-[0.15em] uppercase font-medium" style="color: rgba(201,146,59,0.85);">' + img.label + '</span>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    }
    
    container.innerHTML = html;
    
    // Update showing count
    document.getElementById('showingCount').textContent = 'Showing ' + totalImages + ' creations in 3 scroll rows';
  }
  
  // Override the original renderGallery
  window.renderGallery = renderMarqueeGallery;
  
  // Re-render when filter changes
  var originalFilterCat = window.filterCat;
  window.filterCat = function(cat) {
    currentCategory = cat;
    visibleCount = PER_PAGE;
    filteredImages = getFiltered(cat, searchQuery);
    document.querySelectorAll('.cat-btn').forEach(function(b) { 
      b.classList.toggle('active', b.dataset.cat === cat); 
    });
    renderMarqueeGallery();
    window.scrollTo({ top: document.getElementById('work').offsetTop - 80, behavior: 'smooth' });
  };
  
  // Initial render
  if (filteredImages.length > 0) {
    renderMarqueeGallery();
  }
})();
