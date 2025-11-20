    /* ============================================
   KARADENİZ YEMEKLERİ - SCRIPT.JS
   JavaScript Etkileşimleri ve Fonksiyonlar
   ============================================ */

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
  // Sayfa yüklendiğinde loader'ı kaldır
  const loader = document.querySelector('.page-loader');
  if (loader) {
    loader.classList.remove('active');
    setTimeout(() => {
      loader.remove();
    }, 200);
  }
  
  initMobileMenu();
  initHeroCarousel();
  initDishesCarousel();
  initDishModalButtons();
  initRecipeModals();
  initContactForm();
  initSmoothScroll();
  initRecipesByCategory();
  initPageTransitions();
  initRecipeDetailPage(); // Tarif detay sayfası için
  initAuthSystem(); // Kullanıcı giriş/kayıt sistemi
});

/* ============================================
   HERO CAROUSEL - Ana Sayfa Carousel
   ============================================ */
function initHeroCarousel() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.dot');
  const prevBtn = carousel.querySelector('.carousel-btn-prev');
  const nextBtn = carousel.querySelector('.carousel-btn-next');

  let currentSlide = 0;
  let carouselInterval;

  // Toplam slide sayısı
  const totalSlides = slides.length;

  // Slide göster fonksiyonu
  function showSlide(index) {
    // Slide index'ini sınırla
    if (index >= totalSlides) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = totalSlides - 1;
    } else {
      currentSlide = index;
    }

    // Tüm slide'ları gizle
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (dots[i]) {
        dots[i].classList.remove('active');
      }
    });

    // Aktif slide'ı göster
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  // Sonraki slide'a geç
  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  // Önceki slide'a geç
  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  // Belirli bir slide'a geç
  function goToSlide(index) {
    showSlide(index);
  }

  // Otomatik geçişi başlat
  function startAutoSlide() {
    carouselInterval = setInterval(nextSlide, 5000); // 5 saniyede bir geçiş
  }

  // Otomatik geçişi durdur
  function stopAutoSlide() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }
  }

  // Event Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      nextSlide();
      stopAutoSlide();
      startAutoSlide(); // Yeniden başlat
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      prevSlide();
      stopAutoSlide();
      startAutoSlide(); // Yeniden başlat
    });
  }

  // Dot'lara tıklama
  dots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      goToSlide(index);
      stopAutoSlide();
      startAutoSlide(); // Yeniden başlat
    });
  });

  // Mouse carousel üzerindeyken otomatik geçişi durdur
  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);

  // Touch events (mobil için swipe desteği)
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });

  carousel.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50; // Minimum swipe mesafesi
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Sola kaydırma - sonraki slide
        nextSlide();
      } else {
        // Sağa kaydırma - önceki slide
        prevSlide();
      }
      stopAutoSlide();
      startAutoSlide();
    }
  }

  // Klavye ile kontrol (opsiyonel)
  document.addEventListener('keydown', function(e) {
    if (carousel.querySelector('.carousel-slide.active')) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        stopAutoSlide();
        startAutoSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        stopAutoSlide();
        startAutoSlide();
      }
    }
  });

  // İlk slide'ı göster ve otomatik geçişi başlat
  showSlide(0);
  startAutoSlide();
}

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    // Menü dışına tıklandığında menüyü kapat
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navMenu.contains(event.target);
      const isClickOnToggle = navToggle.contains(event.target);

      if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });

    // Menü linklerine tıklandığında menüyü kapat
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }
}

/* ============================================
   DISHES CAROUSEL - Popüler Yemekler Carousel
   ============================================ */
function initDishesCarousel() {
  const carouselWrapper = document.querySelector('.dishes-carousel-wrapper');
  if (!carouselWrapper) return;

  const track = carouselWrapper.querySelector('.dishes-carousel-track');
  const cards = track.querySelectorAll('.dish-card');
  const prevBtn = carouselWrapper.querySelector('.dishes-carousel-prev');
  const nextBtn = carouselWrapper.querySelector('.dishes-carousel-next');
  const dots = carouselWrapper.querySelectorAll('.dish-dot');

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  const totalCards = cards.length;
  let cardsPerView = getCardsPerView();
  let maxIndex = Math.max(0, totalCards - cardsPerView);

  // Ekran boyutuna göre görünen kart sayısını belirle
  function getCardsPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  // Carousel'i güncelle
  function updateCarousel() {
    // Kartların gerçek genişliğini ölç
    if (cards.length === 0) return;
    
    const firstCard = cards[0];
    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const gap = 32; // 2rem = 32px (CSS gap değeri)
    
    // Transform değerini hesapla
    const translateX = -(currentIndex * (cardWidth + gap));
    track.style.transform = `translateX(${translateX}px)`;

    // Dots'ları güncelle
    const totalSlides = Math.ceil(totalCards / cardsPerView);
    const dotIndex = Math.floor(currentIndex / cardsPerView);
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === dotIndex);
    });
    
    // Yükseklikleri eşitle
    setTimeout(equalizeDishCardHeights, 50);
  }

  // Sonraki slide
  function nextSlide() {
    cardsPerView = getCardsPerView();
    maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = Math.min(currentIndex + cardsPerView, maxIndex);
    updateCarousel();
  }

  // Önceki slide
  function prevSlide() {
    cardsPerView = getCardsPerView();
    maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = Math.max(currentIndex - cardsPerView, 0);
    updateCarousel();
  }

  // Belirli bir slide'a git
  function goToSlide(index) {
    cardsPerView = getCardsPerView();
    maxIndex = Math.max(0, totalCards - cardsPerView);
    currentIndex = Math.min(index * cardsPerView, maxIndex);
    updateCarousel();
  }

  // Event listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }

  // Dots'lara tıklama
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Resize event
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      cardsPerView = getCardsPerView();
      maxIndex = Math.max(0, totalCards - cardsPerView);
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      updateCarousel();
    }, 250);
  });

  // İlk yükleme - DOM ve görseller tam yüklendikten sonra
  window.addEventListener('load', function() {
    updateCarousel();
    setTimeout(equalizeDishCardHeights, 100);
  });
  
  // Fallback için timeout
  setTimeout(function() {
    updateCarousel();
    setTimeout(equalizeDishCardHeights, 100);
  }, 300);
}

/* ============================================
   DISH MODAL BUTTONS - Yemek Kartları Modal Butonları
   ============================================ */
function initDishModalButtons() {
  const modalButtons = document.querySelectorAll('.dish-modal-btn');

  modalButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Kart tıklamasını engelle
      const recipeId = this.getAttribute('data-recipe-id');
      if (recipeId) {
        openRecipeModal(recipeId);
      }
    });
  });

  // Tüm kart içeriklerinin yüksekliğini eşitle
  equalizeDishCardHeights();
}

// Kart içerik yüksekliklerini eşitle
function equalizeDishCardHeights() {
  const carouselWrapper = document.querySelector('.dishes-carousel-wrapper');
  if (!carouselWrapper) return;
  
  const dishContents = carouselWrapper.querySelectorAll('.dish-content');
  if (dishContents.length === 0) return;

  // Tüm yükseklikleri sıfırla
  dishContents.forEach(content => {
    content.style.height = 'auto';
  });

  // Kısa bir gecikme ile ölçüm yap (DOM güncellemesi için)
  setTimeout(function() {
    // En yüksek içeriği bul
    let maxHeight = 0;
    dishContents.forEach(content => {
      const height = content.offsetHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    });

    // Tüm içeriklere en yüksek yüksekliği uygula
    if (maxHeight > 0) {
      dishContents.forEach(content => {
        content.style.height = maxHeight + 'px';
      });
    }
  }, 10);
}

// Resize event'inde de yükseklikleri eşitle
window.addEventListener('resize', function() {
  setTimeout(equalizeDishCardHeights, 100);
});

/* ============================================
   RECIPE MODALS - Tarif Detay Modal'ları
   ============================================ */
function initRecipeModals() {
  const recipeCards = document.querySelectorAll('.recipe-card');
  const modal = document.querySelector('.recipe-modal');
  const modalClose = document.querySelector('.modal-close');

  // Tarif kartlarına tıklandığında modal aç
  recipeCards.forEach(card => {
    card.addEventListener('click', function() {
      const recipeId = this.getAttribute('data-recipe-id');
      if (recipeId && modal) {
        openRecipeModal(recipeId);
      }
    });
  });

  // Modal kapat butonu
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      closeRecipeModal();
    });
  }

  // Modal dışına tıklandığında kapat
  if (modal) {
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeRecipeModal();
      }
    });
  }

  // ESC tuşu ile modal kapat
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeRecipeModal();
    }
  });

  // URL hash'inden modal aç (sayfa yenilendiğinde veya link ile geldiğinde)
  if (window.location.hash) {
    const hash = window.location.hash.replace('#dish-', '');
    if (hash && modal) {
      setTimeout(() => {
        openRecipeModal(hash);
      }, 500);
    }
  }
}

// Modal açma fonksiyonu
function openRecipeModal(recipeId) {
  console.log('🔍 openRecipeModal çağrıldı, Tarif ID:', recipeId);
  
  const modal = document.querySelector('.recipe-modal');
  if (!modal) {
    console.error('❌ Modal elementi bulunamadı!');
    alert('Modal bulunamadı! Lütfen sayfayı yenileyin.');
    return;
  }
  
  console.log('✅ Modal bulundu:', modal);

  // Tarif verilerini al
  const recipe = getRecipeData(recipeId);
  
  if (!recipe) {
    console.error('❌ Tarif bulunamadı:', recipeId);
    alert('Tarif bulunamadı! ID: ' + recipeId);
    return;
  }
  
  console.log('✅ Tarif bulundu:', recipe.name);
  
  // Modal içeriğini doldur
  try {
    fillModalContent(recipe);
    console.log('✅ Modal içeriği dolduruldu');
    
    // Body scroll'unu engelle (arka plan kaydırmasını durdur)
    document.body.style.overflow = 'hidden';
    
    // Modal content'i scroll'unu sıfırla
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
    
    // Modal'ı göster - önce class ekle
    modal.classList.add('active');
    
    // Display'i de manuel olarak ayarla (CSS !important override için)
    modal.style.display = 'flex';
    
    console.log('✅ Modal açıldı. Active class:', modal.classList.contains('active'));
    console.log('✅ Modal display:', window.getComputedStyle(modal).display);
  } catch (error) {
    console.error('❌ Modal içeriği doldurulurken hata:', error);
    alert('Modal açılırken hata oluştu: ' + error.message);
  }
}

// Modal kapatma fonksiyonu
function closeRecipeModal() {
  const modal = document.querySelector('.recipe-modal');
  if (modal) {
    // Modal'ı kapat
    modal.classList.remove('active');
    
    // Display'i de kaldır
    modal.style.display = '';
    
    // Body scroll'unu geri aç
    document.body.style.overflow = '';
    
    // URL'den hash'i kaldır
    if (window.location.hash) {
      window.history.replaceState(null, null, ' ');
    }
    
    console.log('✅ Modal kapatıldı');
  }
}

// Modal içeriğini doldur
function fillModalContent(recipe) {
  // Recipe objesinin gerekli özelliklerini kontrol et
  if (!recipe || typeof recipe !== 'object') {
    console.error('Geçersiz tarif verisi:', recipe);
    return;
  }

  const modalTitle = document.querySelector('.modal-content h2');
  const modalImage = document.querySelector('.modal-image img');
  const modalIngredients = document.querySelector('.modal-ingredients');
  const modalInstructions = document.querySelector('.modal-instructions');
  const modalVideo = document.querySelector('.modal-video');

  // Başlık
  if (modalTitle && recipe.name) {
    modalTitle.textContent = recipe.name;
  }

  // Görsel
  if (modalImage && recipe.image) {
    modalImage.src = recipe.image;
    modalImage.alt = recipe.name || 'Tarif görseli';
  }

  // Malzemeler listesi
  if (modalIngredients) {
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      modalIngredients.innerHTML = '<h3>Malzemeler</h3><ul>';
      recipe.ingredients.forEach(ingredient => {
        if (ingredient && ingredient.trim() !== '') {
          modalIngredients.innerHTML += `<li>${ingredient}</li>`;
        }
      });
      modalIngredients.innerHTML += '</ul>';
    } else {
      modalIngredients.innerHTML = '<h3>Malzemeler</h3><p>Malzeme bilgisi bulunamadı.</p>';
    }
  }

  // Yapılış talimatları
  if (modalInstructions) {
    if (recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
      modalInstructions.innerHTML = '<h3>Yapılışı</h3><ol>';
      recipe.instructions.forEach(instruction => {
        if (instruction && instruction.trim() !== '') {
          modalInstructions.innerHTML += `<li>${instruction}</li>`;
        }
      });
      modalInstructions.innerHTML += '</ol>';
    } else {
      modalInstructions.innerHTML = '<h3>Yapılışı</h3><p>Yapılış bilgisi bulunamadı.</p>';
    }
  }

  // Video embed (varsa)
  if (modalVideo) {
    if (recipe.videoUrl && typeof recipe.videoUrl === 'string' && recipe.videoUrl.trim() !== '') {
      try {
        // YouTube URL'ini embed formatına çevir
        let embedUrl = recipe.videoUrl.trim();
        let videoId = null;
        
        // Eğer normal YouTube URL'si ise embed formatına çevir
        if (embedUrl.includes('youtube.com/watch?v=')) {
          const match = embedUrl.match(/[?&]v=([^&]+)/);
          if (match && match[1]) {
            videoId = match[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (embedUrl.includes('youtu.be/')) {
          const match = embedUrl.match(/youtu\.be\/([^?&]+)/);
          if (match && match[1]) {
            videoId = match[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (embedUrl.includes('youtube.com/embed/')) {
          // Zaten embed formatında
          const match = embedUrl.match(/embed\/([^?&]+)/);
          if (match && match[1]) {
            videoId = match[1];
          }
        }
        
        // Video ID bulunduysa embed'i oluştur
        if (videoId && embedUrl.includes('embed/')) {
          // Orijinal video URL'ini sakla (fallback için)
          const originalUrl = recipe.videoUrl;
          const safeTitle = (recipe.name || 'Video').replace(/"/g, '&quot;');
          
          // YouTube thumbnail URL'i
          const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          
          // Video iframe'ini başlangıçta tıklanabilir placeholder olarak oluştur
          // Sadece kullanıcı tıkladığında videoyu yükle
          modalVideo.innerHTML = `
            <h3>📺 Video Tarifi</h3>
            <div class="video-container clickable-video" data-video-url="${embedUrl}" data-video-id="${videoId}" data-video-title="${safeTitle}">
              <div class="video-placeholder" style="background-image: url('${thumbnailUrl}')">
                <div class="video-placeholder-overlay">
                  <div class="video-placeholder-content">
                    <svg class="video-placeholder-icon" viewBox="0 0 68 48">
                      <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                      <path d="M 45,24 27,14 27,34" fill="#fff"></path>
                    </svg>
                    <p>Videoyu Oynat</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="video-note"><a href="${originalUrl}" target="_blank" rel="noopener noreferrer">YouTube'da aç →</a></p>
          `;
          
          // Video container'a tıklama event listener ekle
          const videoContainer = modalVideo.querySelector('.clickable-video');
          if (videoContainer) {
            videoContainer.addEventListener('click', function() {
              const url = this.getAttribute('data-video-url');
              const title = this.getAttribute('data-video-title');
              
              // Placeholder'ı kaldır ve videoyu yükle
              loadVideoIframe(this, url, title);
              
              // clickable class'ı kaldır (bir kere tıklanabilir)
              this.classList.remove('clickable-video');
            });
          }
        } else {
          console.warn('Geçersiz YouTube URL formatı:', recipe.videoUrl);
          modalVideo.innerHTML = '';
        }
      } catch (error) {
        console.error('Video embed oluşturulurken hata:', error);
        modalVideo.innerHTML = '';
      }
    } else {
      modalVideo.innerHTML = '';
    }
  }
}

// Video iframe'ini yükle (kullanıcı tıkladığında)
function loadVideoIframe(container, embedUrl, title) {
  console.log('🎥 loadVideoIframe çağrıldı');
  console.log('📦 Container:', container);
  console.log('🔗 Embed URL:', embedUrl);
  
  if (!container) {
    console.error('❌ Container bulunamadı!');
    return;
  }
  
  const placeholder = container.querySelector('.video-placeholder');
  if (!placeholder) {
    console.error('❌ Placeholder bulunamadı!');
    return;
  }
  
  console.log('✅ Placeholder bulundu, video yükleniyor...');
  
  // Placeholder'ı kaldır
  placeholder.remove();
  
  // Iframe oluştur ve ekle
  const iframe = document.createElement('iframe');
  iframe.src = `${embedUrl}?rel=0&modestbranding=1&autoplay=1`;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', title || 'YouTube Video');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '10px';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  
  container.appendChild(iframe);
  console.log('✅ Video iframe eklendi!');
}

// Kategori bilgilerini getir
function getRecipeCategories() {
  return {
    'hamsi': {
      name: 'Hamsi Yemekleri',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 9.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-4.44 6-7 6-4.56 0-8.56-2.54-9.5-6z"></path><path d="M18 12v.5"></path><path d="M16 17.93a9.77 9.77 0 0 1-2 .07c-4.56 0-8.56-2.54-9.5-6 .88-3.21 4.31-5.67 8.5-5.98"></path><circle cx="12" cy="12" r="1"></circle></svg>',
      color: '#1e7a4e',
      recipeIds: ['1', '7', '10', '14', '17', '20']
    },
    'corbalar': {
      name: 'Çorbalar',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 0 0 .5"></path><path d="M12 12v7"></path><path d="M8 19h8"></path><circle cx="12" cy="12" r="2"></circle><path d="M12 4v4"></path><path d="M12 2a10 10 0 0 0-7 17"></path></svg>',
      color: '#2d5016',
      recipeIds: ['8', '15', '17']
    },
    'ekmekler': {
      name: 'Ekmekler & Börekler',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18"></path><path d="M3 7h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path><path d="M7 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"></path><path d="M7 15v2"></path><path d="M12 15v2"></path><path d="M17 15v2"></path></svg>',
      color: '#4a7c2a',
      recipeIds: ['2', '9', '11', '13', '20']
    },
    'sebzeler': {
      name: 'Sebze Yemekleri',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"></path><path d="M10 20c0-1.5.5-2.5 1.5-3.5S14 15 16 15c1.5 0 2.5 1 2.5 2.5S16.5 20 15 20H9c-1-.2-2-1.2-2-2.5S8 15 9.5 15s2.5 1.5 2.5 3.5"></path><path d="M12 15V9"></path><path d="M12 9c2-2.5 2-5 2-7"></path><path d="M12 9c-2-2.5-2-5-2-7"></path></svg>',
      color: '#5a9a3a',
      recipeIds: ['3', '12', '16', '18', '19']
    },
    'ozel': {
      name: 'Özel Yemekler',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>',
      color: '#6ba84a',
      recipeIds: ['4', '5', '6', '21']
    }
  };
}

// Tarif verilerini getir (örnek veri)
function getRecipeData(recipeId) {
  const recipes = {
    '1': {
      name: 'Hamsi Tava',
      image: 'assets/img/Hamsi-tava.jpg',
      ingredients: [
        '500g taze hamsi',
        '1 su bardağı un',
        '1 çay kaşığı tuz',
        'Yarım çay kaşığı karabiber',
        'Ayçiçek yağı (kızartma için)',
        'Limon'
      ],
      instructions: [
        'Hamsileri temizleyin, kafalarını ve iç organlarını çıkarın.',
        'Hamsileri güzelce yıkayın ve kurulayın.',
        'Un, tuz ve karabiberi bir kasede karıştırın.',
        'Hamsileri una bulayın, fazla unu silkeleyin.',
        'Kızgın yağda altın sarısı olana kadar kızartın.',
        'Kağıt havlu üzerine alın ve sıcak servis yapın.',
        'Yanında limon ile servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=PtySkwmFdLw'
    },
    '2': {
      name: 'Mısır Ekmeği',
      image: 'assets/img/Mısır-ekmeği.jpg',
      ingredients: [
        '2 su bardağı mısır unu',
        '1 su bardağı sıcak su',
        '1 çay kaşığı tuz',
        'Yarım çay kaşığı şeker (opsiyonel)'
      ],
      instructions: [
        'Mısır ununu bir kaseye alın.',
        'Tuz ve şekeri ekleyin.',
        'Sıcak suyu yavaş yavaş ekleyerek yoğurun.',
        'Hamur yumuşak ve esnek olmalı.',
        'Hamuru ikiye bölün ve yuvarlak şekil verin.',
        'Kızgın tavada veya sac üzerinde pişirin.',
        'Her iki tarafını da altın sarısı olana kadar pişirin.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=Y0Xt9T4OYSo'
    },
    '3': {
      name: 'Lahana Sarması',
      image: 'assets/img/Lahana-Sarması.jpg',
      ingredients: [
        '1 adet büyük lahana',
        '250g kıyma',
        '1 su bardağı pirinç',
        '1 adet soğan',
        '2 yemek kaşığı domates salçası',
        'Tuz, karabiber, kırmızı biber',
        '2 yemek kaşığı zeytinyağı',
        '1 su bardağı sıcak su'
      ],
      instructions: [
        'Lahanayı yapraklarına ayırın ve haşlayın.',
        'Soğanı ince doğrayın ve zeytinyağında kavurun.',
        'Kıymayı ekleyin ve kavurmaya devam edin.',
        'Salça, baharatlar ve yıkanmış pirinci ekleyin.',
        'İç harcı hazır olunca lahana yapraklarına sarın.',
        'Tencereye dizin, üzerine sıcak su ekleyin.',
        'Kısık ateşte 45-60 dakika pişirin.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=6U1p-zh8gt8'
    },
    '4': {
      name: 'Kuymak',
      image: 'assets/img/kuymak.jpg',
      ingredients: [
        '2 su bardağı mısır unu',
        '200g kaşar peyniri',
        '100g tereyağı',
        '2 su bardağı sıcak su',
        'Tuz'
      ],
      instructions: [
        'Tereyağını bir tencerede eritin.',
        'Mısır ununu ekleyin ve kavurun.',
        'Sıcak suyu yavaş yavaş ekleyerek karıştırın.',
        'Kıvam alana kadar pişirin.',
        'Rendelenmiş kaşar peynirini ekleyin.',
        'Peynir eriyene kadar karıştırın.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=9JXvWRcbzew'
    },
    '5': {
      name: 'Fasulye Turşusu',
      image: 'assets/img/fasulye-turşusu.jpg',
      ingredients: [
        '1 kg taze fasulye',
        '2 yemek kaşığı tuz',
        '1 su bardağı sirke',
        '2 su bardağı su',
        '3-4 diş sarımsak',
        '1 yemek kaşığı şeker'
      ],
      instructions: [
        'Fasulyeleri temizleyin ve yıkayın.',
        'Kaynar suda 2-3 dakika haşlayın.',
        'Soğuk suda soğutun.',
        'Turşu kavanozuna fasulyeleri yerleştirin.',
        'Sarımsakları ekleyin.',
        'Tuz, şeker, sirke ve suyu karıştırıp kavanoza dökün.',
        'Kapağını kapatın ve serin yerde bekletin.',
        '2-3 hafta sonra tüketilebilir.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=gvGp60m2lqo'
    },
    '6': {
      name: 'Mıhlama',
      image: 'assets/img/mıhlama.jpeg',
      ingredients: [
        '2 su bardağı mısır unu',
        '150g tereyağı',
        '200g tulum peyniri',
        '1 su bardağı sıcak su',
        'Tuz'
      ],
      instructions: [
        'Tereyağını tencerede eritin.',
        'Mısır ununu ekleyip kavurun.',
        'Sıcak suyu azar azar ekleyin.',
        'Sürekli karıştırarak pişirin.',
        'Rendelenmiş peyniri ekleyin.',
        'Peynir eriyene kadar karıştırın.',
        'Kıvam alınca servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=sXRkdiHXv3Q'
    },
    '7': {
      name: 'Hamsi Köfte',
      image: 'assets/img/hamsi-köfte.jpg',
      ingredients: [
        '500g hamsi',
        '1 adet soğan',
        '2 yemek kaşığı un',
        '1 yumurta',
        'Tuz, karabiber, kırmızı biber',
        'Ayçiçek yağı'
      ],
      instructions: [
        'Hamsileri temizleyin ve fileto çıkarın.',
        'Soğanı rendeleyin.',
        'Hamsi filetolarını, soğan, un, yumurta ve baharatları karıştırın.',
        'Hamur kıvamına gelene kadar yoğurun.',
        'Köfte şekli verin.',
        'Kızgın yağda kızartın.',
        'Kağıt havlu üzerine alın ve servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=3LJdxWZKkyA'
    },
    '8': {
      name: 'Karalahana Çorbası',
      image: 'assets/img/Karalahana-çorbası.jpg',
      ingredients: [
        '1 demet karalahana',
        '2 yemek kaşığı mısır unu',
        '1 adet soğan',
        '2 yemek kaşığı zeytinyağı',
        '1 yemek kaşığı domates salçası',
        '6 su bardağı su',
        'Tuz, karabiber'
      ],
      instructions: [
        'Karalahanaları yıkayın ve ince doğrayın.',
        'Soğanı küp küp doğrayın.',
        'Zeytinyağında soğanı kavurun.',
        'Salçayı ekleyin ve kavurun.',
        'Karalahanaları ekleyin.',
        'Su ve baharatları ekleyin.',
        'Kaynadıktan sonra mısır ununu az su ile açıp ekleyin.',
        '20-25 dakika pişirin ve servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=9OYnueSlGOQ'
    },
    '9': {
      name: 'Karadeniz Pidesi',
      image: 'assets/img/karadeniz-pidesi.png',
      ingredients: [
        '500g un',
        '1 paket kuru maya',
        '1 su bardağı ılık su',
        '1 çay kaşığı tuz',
        '1 çay kaşığı şeker',
        'İç malzeme: kıyma, soğan, baharatlar'
      ],
      instructions: [
        'Maya, şeker ve ılık suyu karıştırıp bekleyin.',
        'Un, tuz ve mayalı suyu karıştırıp yoğurun.',
        'Hamuru 1 saat mayalandırın.',
        'İç malzemeyi hazırlayın.',
        'Hamuru açın ve iç malzemeyi yerleştirin.',
        'Fırında 200°C\'de 20-25 dakika pişirin.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=yIvRFyiM-eU'
    },
    '10': {
      name: 'Hamsi Buğulama',
      image: 'assets/img/Hamsi-buğlama.jpg',
      ingredients: [
        '500g taze hamsi',
        '2 adet soğan',
        '2 adet domates',
        '2 yemek kaşığı zeytinyağı',
        '1 limon',
        'Tuz, karabiber',
        'Yarım demet maydanoz'
      ],
      instructions: [
        'Hamsileri temizleyin ve yıkayın.',
        'Soğanları halka halka doğrayın.',
        'Domatesleri küp küp doğrayın.',
        'Tencereye zeytinyağı, soğan ve domatesi koyun.',
        'Hamsileri üzerine dizin.',
        'Tuz, karabiber ve limon suyu ekleyin.',
        'Kapağını kapatıp kısık ateşte 20 dakika pişirin.',
        'Maydanoz ile süsleyip servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=4Yzg9GN3p-Y'
    },
    '11': {
      name: 'Laz Böreği',
      image: 'assets/img/Laz-Böreği.png',
      ingredients: [
        '10 yufka',
        '500ml süt',
        '200g şeker',
        '3 yemek kaşığı un',
        '2 yemek kaşığı nişasta',
        '1 paket vanilya',
        '200g tereyağı'
      ],
      instructions: [
        'Krema için süt, şeker, un ve nişastayı karıştırın.',
        'Kısık ateşte koyulaşana kadar pişirin.',
        'Vanilyayı ekleyip soğumaya bırakın.',
        'Yufkaları ikiye bölün.',
        'Her yufkayı tereyağı ile yağlayın.',
        'Kremayı yufkaların arasına sürün.',
        'Kat kat dizin ve fırına verin.',
        '180°C\'de 30-35 dakika pişirin.',
        'Soğuduktan sonra servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=0PJc54q2zkg'
    },
    '12': {
      name: 'Pancar Sarması',
      image: 'assets/img/Pancar-sarması.jpeg',
      ingredients: [
        '1 demet pancar yaprağı',
        '1 su bardağı pirinç',
        '1 adet soğan',
        '2 yemek kaşığı zeytinyağı',
        '1 yemek kaşığı domates salçası',
        'Tuz, karabiber, nane',
        '1 su bardağı sıcak su'
      ],
      instructions: [
        'Pancar yapraklarını yıkayın ve haşlayın.',
        'Soğanı ince doğrayıp zeytinyağında kavurun.',
        'Salça, baharatlar ve yıkanmış pirinci ekleyin.',
        'İç harcı hazır olunca pancar yapraklarına sarın.',
        'Tencereye dizin ve üzerine sıcak su ekleyin.',
        'Kısık ateşte 40-50 dakika pişirin.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=UvVo0blcUQw'
    },
    '13': {
      name: 'Peynirli Ekmek',
      image: 'assets/img/peynirli-ekmek.jpg',
      ingredients: [
        '2 su bardağı mısır unu',
        '200g kaşar peyniri',
        '1 su bardağı sıcak su',
        '1 çay kaşığı tuz',
        '50g tereyağı'
      ],
      instructions: [
        'Mısır ununu bir kaseye alın.',
        'Tuzu ekleyin ve sıcak suyu yavaş yavaş dökün.',
        'Yoğurarak hamur haline getirin.',
        'Rendelenmiş peyniri ekleyin ve karıştırın.',
        'Hamuru ikiye bölün ve yuvarlak şekil verin.',
        'Kızgın tavada veya sac üzerinde pişirin.',
        'Her iki tarafını da altın sarısı olana kadar pişirin.',
        'Tereyağı ile yağlayıp sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=1ei6MvphgaQ'
    },
    '14': {
      name: 'Hamsi Pilavı',
      image: 'assets/img/hamsi-pilavı.jpeg',
      ingredients: [
        '500g hamsi',
        '2 su bardağı pirinç',
        '1 adet soğan',
        '2 yemek kaşığı zeytinyağı',
        '1 yemek kaşığı domates salçası',
        '3 su bardağı sıcak su',
        'Tuz, karabiber, kırmızı biber'
      ],
      instructions: [
        'Hamsileri temizleyin ve fileto çıkarın.',
        'Soğanı ince doğrayıp zeytinyağında kavurun.',
        'Salçayı ekleyin ve kavurun.',
        'Yıkanmış pirinci ekleyin ve 2 dakika kavurun.',
        'Sıcak su, tuz ve baharatları ekleyin.',
        'Pirinç yarı pişince hamsi filetolarını üzerine dizin.',
        'Kapağını kapatıp kısık ateşte 20 dakika pişirin.',
        '10 dakika dinlendirip servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=TeNuB9JATyY'
    },
    '15': {
      name: 'Mısır Çorbası',
      image: 'assets/img/Mısır-çorbası.jpeg',
      ingredients: [
        '1 su bardağı mısır unu',
        '1 adet soğan',
        '1 adet havuç',
        '1 adet patates',
        '2 yemek kaşığı zeytinyağı',
        '6 su bardağı su',
        'Tuz, karabiber',
        'Yarım demet maydanoz'
      ],
      instructions: [
        'Soğan, havuç ve patatesi küp küp doğrayın.',
        'Zeytinyağında soğanı kavurun.',
        'Havuç ve patatesi ekleyin.',
        'Suyu ekleyin ve kaynatın.',
        'Mısır ununu az su ile açıp yavaş yavaş ekleyin.',
        'Sürekli karıştırarak 15-20 dakika pişirin.',
        'Tuz ve baharatları ekleyin.',
        'Maydanoz ile süsleyip servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=gkbNob7eWH0'
    },
    '16': {
      name: 'Karalahana Kavurması',
      image: 'assets/img/karalahana-kavurması.jpg',
      ingredients: [
        '1 demet karalahana',
        '2 adet soğan',
        '3 yemek kaşığı zeytinyağı',
        '2 yemek kaşığı domates salçası',
        'Tuz, karabiber, kırmızı biber',
        '1 su bardağı su'
      ],
      instructions: [
        'Karalahanaları yıkayın ve ince doğrayın.',
        'Soğanları ince doğrayın.',
        'Zeytinyağında soğanı kavurun.',
        'Salçayı ekleyin ve kavurun.',
        'Karalahanaları ekleyin ve karıştırın.',
        'Suyu ekleyin ve kapağını kapatın.',
        'Kısık ateşte 20-25 dakika pişirin.',
        'Baharatları ekleyip karıştırın ve servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=27aBUvXQhWU'
    },
    '17': {
      name: 'Hamsi Çorbası',
      image: 'assets/img/hamsi-corbasi.jpg',
      ingredients: [
        '500g hamsi',
        '1 adet soğan',
        '1 adet havuç',
        '1 adet patates',
        '2 yemek kaşığı zeytinyağı',
        '1 yemek kaşığı domates salçası',
        '6 su bardağı su',
        'Tuz, karabiber, kırmızı biber',
        'Yarım demet dereotu'
      ],
      instructions: [
        'Hamsileri temizleyin ve kafalarını çıkarın.',
        'Soğan, havuç ve patatesi küp küp doğrayın.',
        'Zeytinyağında soğanı kavurun.',
        'Salçayı ekleyin ve kavurun.',
        'Havuç ve patatesi ekleyin.',
        'Suyu ekleyin ve kaynatın.',
        'Sebzeler yumuşayınca hamsileri ekleyin.',
        '5-7 dakika pişirin, baharatları ekleyin.',
        'Dereotu ile süsleyip sıcak servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=615ilBGYfc8'
    },
    '18': {
      name: 'Karalahana Diblesi',
      image: 'assets/img/Karalahana-diblesi.jpeg',
      ingredients: [
        '1 demet karalahana',
        '2 su bardağı mısır unu',
        '200g tulum peyniri',
        '2 adet soğan',
        '3 yemek kaşığı zeytinyağı',
        'Tuz, karabiber',
        '1 su bardağı sıcak su'
      ],
      instructions: [
        'Karalahanaları yıkayın ve ince doğrayın.',
        'Soğanı ince doğrayıp zeytinyağında kavurun.',
        'Karalahanaları ekleyin ve kavurun.',
        'Mısır ununu ekleyin ve kavurmaya devam edin.',
        'Sıcak suyu azar azar ekleyin.',
        'Kıvam alana kadar pişirin.',
        'Rendelenmiş peyniri ekleyin.',
        'Peynir eriyene kadar karıştırın.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=iB0hqcL3oJM'
    },
    '19': {
      name: 'Turşu Kızartması',
      image: 'assets/img/Turşu-kizarmasi.jpg',
      ingredients: [
        '500g turşu (lahana, havuç, salatalık)',
        '1 su bardağı un',
        '2 yumurta',
        '1 çay kaşığı tuz',
        'Ayçiçek yağı (kızartma için)'
      ],
      instructions: [
        'Turşuları süzün ve fazla suyunu alın.',
        'Un, yumurta ve tuzu bir kasede karıştırın.',
        'Turşuları hamura bulayın.',
        'Kızgın yağda altın sarısı olana kadar kızartın.',
        'Kağıt havlu üzerine alın.',
        'Sıcak servis yapın.',
        'Yanında yoğurt ile servis edebilirsiniz.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=anybG_TNikI'
    },
    '20': {
      name: 'Hamsi Böreği',
      image: 'assets/img/Hamsi-böreğşi.jpeg',
      ingredients: [
        '500g hamsi',
        '6 yufka',
        '2 adet soğan',
        '3 yemek kaşığı zeytinyağı',
        'Tuz, karabiber',
        '200g tereyağı'
      ],
      instructions: [
        'Hamsileri temizleyin ve fileto çıkarın.',
        'Soğanı ince doğrayıp zeytinyağında kavurun.',
        'Hamsi filetolarını ekleyin ve hafifçe pişirin.',
        'Baharatları ekleyin ve soğumaya bırakın.',
        'Yufkaları ikiye bölün.',
        'Her yufkayı tereyağı ile yağlayın.',
        'Hamsi harcını yufkaların üzerine yayın.',
        'Rulo şeklinde sarın ve tepsiye dizin.',
        'Fırında 180°C\'de 30-35 dakika pişirin.',
        'Sıcak servis yapın.'
      ],
      videoUrl: 'https://youtu.be/fgxce-vXZCY'
    },
    '21': {
      name: 'Peynir Helvası',
      image: 'assets/img/peynir-helvası.jpg',
      ingredients: [
        '500g tulum peyniri',
        '2 su bardağı un',
        '1 su bardağı şeker',
        '200g tereyağı',
        '1 su bardağı süt'
      ],
      instructions: [
        'Peyniri rendeleyin.',
        'Tereyağını eritin.',
        'Unu ekleyin ve kavurun.',
        'Rendelenmiş peyniri ekleyin.',
        'Sürekli karıştırarak pişirin.',
        'Şekeri ekleyin ve karıştırın.',
        'Sütü azar azar ekleyin.',
        'Kıvam alana kadar pişirin.',
        'Soğuduktan sonra servis edin.'
      ],
      videoUrl: 'https://www.youtube.com/watch?v=f6TES1DwFMk'
    }
  };

  return recipes[recipeId] || null;
}

// Tarif açıklamaları (kısa özetler)
function getRecipeDescription(recipeId) {
  const descriptions = {
    '1': 'Karadeniz\'in vazgeçilmez lezzeti, taze hamsilerin unlanıp kızartılmasıyla hazırlanır.',
    '2': 'Geleneksel Karadeniz ekmeği, mısır unu ile yapılan ve özel bir lezzete sahip ekmek türüdür.',
    '3': 'Kış aylarının vazgeçilmezi, iç pilavlı ve etli olarak hazırlanan geleneksel sarma.',
    '4': 'Mısır unu ve kaşar peyniri ile yapılan, Karadeniz\'in meşhur yemeği.',
    '5': 'Kış ayları için hazırlanan, geleneksel Karadeniz fasulye turşusu.',
    '6': 'Mısır unu, tereyağı ve peynirle yapılan, Doğu Karadeniz\'in özel lezzeti.',
    '7': 'Hamsi, soğan ve baharatlarla hazırlanan, Karadeniz\'in özel köfte tarifi.',
    '8': 'Karadeniz\'in geleneksel çorbası, karalahana ve mısır unu ile yapılır.',
    '9': 'Özel hamur ve çeşitli iç malzemelerle hazırlanan geleneksel pide.',
    '10': 'Hamsilerin soğan ve domatesle buğulanmasıyla hazırlanan nefis yemek.',
    '11': 'Kat kat yufka ve özel kremasıyla hazırlanan Karadeniz\'in meşhur tatlısı.',
    '12': 'Pancar yapraklarıyla yapılan, iç pilavlı geleneksel sarma tarifi.',
    '13': 'Mısır unu ve peynirle yapılan, Karadeniz\'in özel ekmek çeşidi.',
    '14': 'Hamsi ve pirinçle hazırlanan, Karadeniz\'in özel pilav tarifi.',
    '15': 'Mısır unu ve sebzelerle yapılan, besleyici ve lezzetli çorba.',
    '16': 'Karalahana, soğan ve baharatlarla hazırlanan geleneksel kavurma.',
    '17': 'Hamsi, sebzeler ve baharatlarla hazırlanan Karadeniz\'in özel çorbası.',
    '18': 'Karalahana, mısır unu ve peynirle yapılan geleneksel Karadeniz yemeği.',
    '19': 'Turşu sebzelerinin una bulayıp kızartılmasıyla hazırlanan lezzet.',
    '20': 'Yufka içinde hamsi ve soğanla hazırlanan, Karadeniz\'in özel böreği.',
    '21': 'Peynir, un ve şekerle yapılan, Karadeniz\'in geleneksel tatlısı.'
  };
  return descriptions[recipeId] || '';
}

// Tarif süreleri ve porsiyon bilgileri
function getRecipeMeta(recipeId) {
  const meta = {
    '1': { time: '30 dk', servings: '4 kişilik' },
    '2': { time: '45 dk', servings: '6 kişilik' },
    '3': { time: '90 dk', servings: '6 kişilik' },
    '4': { time: '25 dk', servings: '4 kişilik' },
    '5': { time: '60 dk', servings: '8 kişilik' },
    '6': { time: '20 dk', servings: '4 kişilik' },
    '7': { time: '40 dk', servings: '4 kişilik' },
    '8': { time: '50 dk', servings: '6 kişilik' },
    '9': { time: '60 dk', servings: '4 kişilik' },
    '10': { time: '35 dk', servings: '4 kişilik' },
    '11': { time: '90 dk', servings: '8 kişilik' },
    '12': { time: '75 dk', servings: '6 kişilik' },
    '13': { time: '50 dk', servings: '6 kişilik' },
    '14': { time: '45 dk', servings: '4 kişilik' },
    '15': { time: '40 dk', servings: '6 kişilik' },
    '16': { time: '30 dk', servings: '4 kişilik' },
    '17': { time: '40 dk', servings: '6 kişilik' },
    '18': { time: '50 dk', servings: '4 kişilik' },
    '19': { time: '25 dk', servings: '4 kişilik' },
    '20': { time: '55 dk', servings: '6 kişilik' },
    '21': { time: '35 dk', servings: '8 kişilik' }
  };
  return meta[recipeId] || { time: 'N/A', servings: 'N/A' };
}

/* ============================================
   RECIPES BY CATEGORY - Kategorilere Göre Tarifler
   ============================================ */
function initRecipesByCategory() {
  const container = document.getElementById('recipesByCategory');
  if (!container) return;

  const categories = getRecipeCategories();
  let html = '';

  Object.keys(categories).forEach(categoryKey => {
    const category = categories[categoryKey];
    html += `
      <div class="recipe-category-section" data-category="${categoryKey}">
        <div class="category-header" style="border-left: 4px solid ${category.color};">
          <div class="category-title">
            <span class="category-icon">${category.icon}</span>
            <h2>${category.name}</h2>
            <span class="category-count">${category.recipeIds.length} tarif</span>
          </div>
        </div>
        <div class="category-recipes-grid">
    `;

    category.recipeIds.forEach(recipeId => {
      const recipe = getRecipeData(recipeId);
      if (recipe) {
        const description = getRecipeDescription(recipeId);
        const meta = getRecipeMeta(recipeId);
        html += `
          <a href="tarif-detay.html?tarif=${recipeId}" class="recipe-card-small" data-recipe-id="${recipeId}">
            <div class="recipe-image-small">
              <img src="${recipe.image}" alt="${recipe.name}" loading="lazy">
            </div>
            <div class="recipe-content-small">
              <h3>${recipe.name}</h3>
              <p>${description}</p>
              <div class="recipe-meta-small">
                <span>⏱️ ${meta.time}</span>
                <span>👥 ${meta.servings}</span>
              </div>
            </div>
          </a>
        `;
      }
    });

    html += `
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Tarif kartlarına tıklama eventi ekle
  container.querySelectorAll('.recipe-card-small').forEach(card => {
    card.addEventListener('click', function() {
      const recipeId = this.getAttribute('data-recipe-id');
      console.log('🖱️ Karta tıklandı! Recipe ID:', recipeId);
      if (recipeId) {
        openRecipeModal(recipeId);
      } else {
        console.error('❌ Recipe ID bulunamadı!');
      }
    });
  });
  
  console.log('✅ Toplam', container.querySelectorAll('.recipe-card-small').length, 'kart bulundu ve event listener eklendi');
}

/* ============================================
   CONTACT FORM - İletişim Formu Validasyonu
   ============================================ */
function initContactForm() {
  const contactForm = document.querySelector('.contact-form form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = {
        name: this.querySelector('input[name="name"]').value.trim(),
        email: this.querySelector('input[name="email"]').value.trim(),
        message: this.querySelector('textarea[name="message"]').value.trim()
      };

      // Basit validasyon
      if (!formData.name || !formData.email || !formData.message) {
        alert('Lütfen tüm alanları doldurun.');
        return;
      }

      if (!isValidEmail(formData.email)) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
      }

      // Form gönderimi (gerçek uygulamada backend'e gönderilir)
      console.log('Form verileri:', formData);
      alert('Mesajınız başarıyla gönderildi! Teşekkür ederiz.');
      this.reset();
    });
  }
}

// E-posta validasyon fonksiyonu
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/* ============================================
   PAGE TRANSITIONS - Sayfa Geçiş Animasyonları
   ============================================ */

// Loading göstergesini göster
function showPageLoader() {
  // Eğer loader yoksa oluştur
  let loader = document.querySelector('.page-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div class="loader-spinner"></div>
        <div class="loader-text">Yükleniyor...</div>
      </div>
    `;
    document.body.appendChild(loader);
  }
  
  // Loader'ı göster
  setTimeout(() => {
    loader.classList.add('active');
  }, 10);
}

function initPageTransitions() {
  // Tüm internal linkleri yakala (aynı domain içindeki linkler)
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    
    // Sadece internal linkler için (external linkler ve anchor linkler hariç)
    if (href && 
        !href.startsWith('#') && 
        !href.startsWith('http') && 
        !href.startsWith('mailto:') && 
        !href.startsWith('tel:') &&
        href.endsWith('.html')) {
      
      link.addEventListener('click', function(event) {
        // Modal açıkken sayfa geçişini engelle
        const modal = document.querySelector('.recipe-modal');
        if (modal && modal.classList.contains('active')) {
          return;
        }
        
        event.preventDefault();
        const targetUrl = this.getAttribute('href');
        
        // Loading göstergesini göster
        showPageLoader();
        
        // Fade-out animasyonu başlat
        document.body.classList.add('page-transition-out');
        
        // Animasyon tamamlandıktan sonra sayfaya git (süre azaltıldı)
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 200);
      });
    }
  });
}

/* ============================================
   SMOOTH SCROLL - Yumuşak Kaydırma
   ============================================ */
function initSmoothScroll() {
  // Sayfa içi linkler için smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(event) {
      const href = this.getAttribute('href');
      
      // Sadece sayfa içi linkler için
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

/* ============================================
   UTILITY FUNCTIONS - Yardımcı Fonksiyonlar
   ============================================ */

// Görsel yükleme hatası için fallback
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function() {
      // Görsel yüklenemezse CSS ile placeholder göster
      this.style.display = 'none';
      this.style.backgroundColor = '#2d5016';
      
      // Parent container'a placeholder ekle
      const parent = this.parentElement;
      if (parent && !parent.querySelector('.image-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
            text-align: center;
            padding: 2rem;
          ">
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">🍽️</div>
              <div>Görsel Yükleniyor...</div>
            </div>
          </div>
        `;
        parent.insertBefore(placeholder, this);
      }
    });
  });
});

/* ============================================
   TARIF DETAY SAYFASI - URL Parametresinden Yükleme
   ============================================ */
function initRecipeDetailPage() {
  // Sadece tarif-detay.html sayfasındaysa çalış
  if (!window.location.pathname.includes('tarif-detay.html')) return;
  
  // URL parametresinden tarif ID'sini al
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('tarif');
  
  if (!recipeId) {
    alert('Geçersiz tarif ID! Tarifler sayfasına yönlendiriliyorsunuz.');
    window.location.href = 'tarifler.html';
    return;
  }
  
  // Tarif verilerini al
  const recipe = getRecipeData(recipeId);
  
  if (!recipe) {
    alert('Tarif bulunamadı! Tarifler sayfasına yönlendiriliyorsunuz.');
    window.location.href = 'tarifler.html';
    return;
  }
  
  // Sayfa başlığını güncelle
  document.title = `${recipe.name} Tarifi | Karadeniz Yemekleri`;
  
  // Hero bölümünü doldur
  const heroImage = document.querySelector('.recipe-detail-hero');
  if (heroImage) {
    heroImage.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${recipe.image}')`;
  }
  
  document.getElementById('recipeTitle').textContent = recipe.name;
  
  // Kategori bilgisini al ve göster
  const categories = getRecipeCategories();
  let categoryHTML = '';
  Object.keys(categories).forEach(key => {
    if (categories[key].recipeIds.includes(recipeId)) {
      categoryHTML = `<span class="category-icon">${categories[key].icon}</span> ${categories[key].name}`;
    }
  });
  document.getElementById('recipeCategory').innerHTML = categoryHTML;
  
  // Görsel
  const recipeImage = document.getElementById('recipeImage');
  recipeImage.src = recipe.image;
  recipeImage.alt = recipe.name;
  
  // Tarif bilgileri
  const meta = getRecipeMeta(recipeId);
  document.getElementById('recipeTime').textContent = meta.time;
  document.getElementById('recipeServings').textContent = meta.servings;
  document.getElementById('recipeDifficulty').textContent = meta.difficulty || 'Orta';
  
  // Açıklama
  document.getElementById('recipeDescription').textContent = getRecipeDescription(recipeId);
  
  // Malzemeler
  const ingredientsList = document.getElementById('recipeIngredients');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });
  
  // Yapılışı
  const instructionsList = document.getElementById('recipeInstructions');
  instructionsList.innerHTML = '';
  recipe.instructions.forEach((instruction, index) => {
    const li = document.createElement('li');
    li.textContent = instruction;
    instructionsList.appendChild(li);
  });
  
  // İpuçları (varsa)
  if (recipe.tips && recipe.tips.length > 0) {
    const tipsContainer = document.getElementById('recipeTipsContainer');
    const tipsList = document.getElementById('recipeTips');
    tipsContainer.style.display = 'block';
    tipsList.innerHTML = '';
    recipe.tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      tipsList.appendChild(li);
    });
  }
  
  // Video (varsa)
  if (recipe.videoUrl) {
    const videoContainer = document.getElementById('recipeVideoContainer');
    const videoFrame = document.getElementById('recipeVideoFrame');
    videoContainer.style.display = 'block';
    
    // YouTube URL'ini embed formatına çevir ve video ID'sini al
    let embedUrl = recipe.videoUrl;
    let videoId = '';
    let originalUrl = recipe.videoUrl;
    
    if (embedUrl.includes('youtube.com/watch?v=')) {
      videoId = embedUrl.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (embedUrl.includes('youtu.be/')) {
      videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      originalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } else if (embedUrl.includes('youtube.com/embed/')) {
      videoId = embedUrl.split('/embed/')[1].split('?')[0];
      originalUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const safeTitle = recipe.name.replace(/"/g, '&quot;');
    
    // Lazy loading için video placeholder oluştur
    videoFrame.innerHTML = `
      <div class="video-container clickable-video" data-video-url="${embedUrl}" data-video-title="${safeTitle}">
        <div class="video-placeholder" style="background-image: url('${thumbnailUrl}')">
          <div class="video-placeholder-overlay">
            <div class="video-placeholder-content">
              <svg class="video-placeholder-icon" viewBox="0 0 68 48">
                <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                <path d="M 45,24 27,14 27,34" fill="#fff"></path>
              </svg>
              <p>Videoyu Oynat</p>
            </div>
          </div>
        </div>
      </div>
      <p class="video-note"><a href="${originalUrl}" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i> YouTube'da Aç →</a></p>
    `;
    
    // Video placeholder'a tıklandığında iframe yükle
    const videoPlaceholder = videoFrame.querySelector('.clickable-video');
    if (videoPlaceholder) {
      videoPlaceholder.addEventListener('click', function() {
        console.log('🎬 Video tıklandı!');
        const url = this.getAttribute('data-video-url');
        const title = this.getAttribute('data-video-title');
        console.log('📹 Video URL:', url);
        console.log('📝 Video Başlık:', title);
        loadVideoIframe(this, url, title);
        this.classList.remove('clickable-video');
      });
    } else {
      console.warn('⚠️ Video placeholder bulunamadı!');
    }
  } else {
    console.log('ℹ️ Bu tarif için video bulunamadı');
  }
}

/* ============================================
   BLOG PAGE - Blog Sayfası Fonksiyonları
   ============================================ */

// Blog sayfası için tüm fonksiyonları başlat
document.addEventListener('DOMContentLoaded', function() {
  initBlogFilters();
  initBlogSearch();
  initLoadMoreButton();
});

// Blog filtreleme fonksiyonu
function initBlogFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const blogCards = document.querySelectorAll('.blog-card');
  
  if (filterButtons.length === 0 || blogCards.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Aktif buton stilini değiştir
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const category = this.getAttribute('data-category');
      
      // Blog kartlarını filtrele
      blogCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
          // Animasyon için
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
      
      // Sonuç sayısını göster (opsiyonel)
      updateVisiblePostsCount();
    });
  });
}

// Blog arama fonksiyonu
function initBlogSearch() {
  const searchInput = document.getElementById('blogSearch');
  const blogCards = document.querySelectorAll('.blog-card');
  
  if (!searchInput || blogCards.length === 0) return;
  
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    blogCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const content = card.querySelector('p').textContent.toLowerCase();
      const author = card.querySelector('.blog-author').textContent.toLowerCase();
      
      // Arama terimini başlık, içerik veya yazar adında ara
      if (title.includes(searchTerm) || content.includes(searchTerm) || author.includes(searchTerm)) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
    
    // Eğer arama yapılıyorsa, filtre butonlarını sıfırla
    if (searchTerm) {
      const filterButtons = document.querySelectorAll('.filter-btn');
      filterButtons.forEach(btn => {
        if (btn.getAttribute('data-category') === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
    
    updateVisiblePostsCount();
  });
}

// Görünen yazı sayısını güncelle
function updateVisiblePostsCount() {
  const blogCards = document.querySelectorAll('.blog-card');
  let visibleCount = 0;
  
  blogCards.forEach(card => {
    if (card.style.display !== 'none') {
      visibleCount++;
    }
  });
  
  // Sonuç bulunamazsa mesaj göster (opsiyonel)
  showNoResultsMessage(visibleCount === 0);
}

// Sonuç bulunamadı mesajı
function showNoResultsMessage(show) {
  let noResultsDiv = document.querySelector('.no-results-message');
  
  if (show) {
    if (!noResultsDiv) {
      noResultsDiv = document.createElement('div');
      noResultsDiv.className = 'no-results-message';
      noResultsDiv.style.cssText = `
        text-align: center;
        padding: 4rem 2rem;
        grid-column: 1 / -1;
      `;
      noResultsDiv.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
        <h3 style="color: var(--primary-green); font-size: 1.5rem; margin-bottom: 1rem;">Sonuç Bulunamadı</h3>
        <p style="color: var(--text-gray); font-size: 1.1rem;">Aradığınız kriterlere uygun blog yazısı bulunamadı.</p>
      `;
      
      const blogGrid = document.querySelector('.blog-grid');
      if (blogGrid) {
        blogGrid.appendChild(noResultsDiv);
      }
    }
    noResultsDiv.style.display = 'block';
  } else {
    if (noResultsDiv) {
      noResultsDiv.style.display = 'none';
    }
  }
}

// "Daha Fazla Yükle" butonu fonksiyonu
function initLoadMoreButton() {
  const loadMoreBtn = document.querySelector('.load-more-btn');
  
  if (!loadMoreBtn) return;
  
  loadMoreBtn.addEventListener('click', function() {
    // Burada normalde API'den daha fazla veri çekilir
    // Şimdilik sadece bir mesaj gösterelim
    this.textContent = 'Tüm Yazılar Yüklendi';
    this.disabled = true;
    this.style.opacity = '0.6';
    this.style.cursor = 'not-allowed';
    
    // Gerçek uygulamada:
    // fetchMoreBlogPosts().then(posts => {
    //   renderBlogPosts(posts);
    // });
  });
}

// Blog kartlarına hover efekti (opsiyonel ekstra animasyon)
document.addEventListener('DOMContentLoaded', function() {
  const blogCards = document.querySelectorAll('.blog-card');
  
  blogCards.forEach(card => {
    // İlk yükleme animasyonu
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    // Görünür olduğunda animasyon
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.transition = 'all 0.5s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    observer.observe(card);
  });
});

/* ============================================
   AUTH SYSTEM - Kullanıcı Giriş/Kayıt Sistemi
   ============================================ */

function initAuthSystem() {
  // Sayfa yüklendiğinde kullanıcı durumunu kontrol et
  checkUserStatus();
  
  // Logout butonu
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Form elementleri (login ve register sayfaları için)
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Form submit handlers
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

// Kullanıcı durumunu kontrol et
function checkUserStatus() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userMenu = document.getElementById('userMenu');
  const userNameSpan = document.getElementById('userName');
  
  if (currentUser && currentUser.name) {
    // Kullanıcı giriş yapmış
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userNameSpan) userNameSpan.textContent = currentUser.name;
  } else {
    // Kullanıcı giriş yapmamış
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Kayıt işlemi
function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
  
  // Validasyon
  if (!name || !email || !password || !passwordConfirm) {
    alert('Lütfen tüm alanları doldurun!');
    return;
  }
  
  if (password.length < 6) {
    alert('Şifre en az 6 karakter olmalıdır!');
    return;
  }
  
  if (password !== passwordConfirm) {
    alert('Şifreler eşleşmiyor!');
    return;
  }
  
  // E-posta formatı kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Geçerli bir e-posta adresi girin!');
    return;
  }
  
  // LocalStorage'dan mevcut kullanıcıları al
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  // E-posta kontrolü
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    alert('Bu e-posta adresi zaten kayıtlı!');
    return;
  }
  
  // Yeni kullanıcı oluştur
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password, // Gerçek uygulamada şifrelenmiş olmalı
    createdAt: new Date().toISOString()
  };
  
  // Kullanıcıyı kaydet
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Otomatik giriş yap (sessionStorage kullan - sekme kapandığında silinsin)
  const userToSave = { ...newUser };
  delete userToSave.password; // Şifreyi kaydetme
  sessionStorage.setItem('currentUser', JSON.stringify(userToSave));
  
  // Başarı mesajı ve yönlendirme
  alert(`Hoş geldiniz, ${name}! Kayıt işleminiz başarıyla tamamlandı.`);
  
  // Anasayfaya yönlendir
  window.location.href = 'index.html';
}

// Giriş işlemi
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Validasyon
  if (!email || !password) {
    alert('Lütfen tüm alanları doldurun!');
    return;
  }
  
  // LocalStorage'dan kullanıcıları al
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Kullanıcıyı bul
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    alert('E-posta veya şifre hatalı!');
    return;
  }
  
  // Kullanıcı bilgilerini kaydet (şifre hariç) - sessionStorage kullan
  const userToSave = { ...user };
  delete userToSave.password;
  sessionStorage.setItem('currentUser', JSON.stringify(userToSave));
  
  // Başarı mesajı ve yönlendirme
  alert(`Hoş geldiniz, ${user.name}!`);
  
  // Anasayfaya yönlendir
  window.location.href = 'index.html';
}

// Çıkış işlemi
function handleLogout() {
  if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
    sessionStorage.removeItem('currentUser');
    checkUserStatus();
    alert('Başarıyla çıkış yaptınız!');
  }
}

/* ============================================
   ADVANCED ANIMATIONS & EFFECTS
   Modern efektler ve animasyonlar
   ============================================ */

// Scroll Reveal - Scroll'da elementleri görünür yap
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
  
  if (revealElements.length === 0) return;
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 50;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = revealPoint;
      
      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('revealed');
      }
    });
  };
  
  // İlk yüklemede kontrol et
  revealOnScroll();
  
  // Scroll olayını dinle (throttle ile performans optimizasyonu)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      revealOnScroll();
    });
  });
}

// Otomatik olarak kartlara hover efektleri ekle
function enhanceCardEffects() {
  const cards = document.querySelectorAll('.dish-card, .recipe-card, .blog-card, .category-card');
  
  cards.forEach(card => {
    // Glow efekti ekle
    card.classList.add('glow-on-hover');
    
    // Ripple efekti ekle
    if (!card.classList.contains('ripple')) {
      card.classList.add('ripple');
    }
  });
}

// Stagger animasyonlarını başlat
function initStaggerAnimations() {
  const containers = document.querySelectorAll('.dishes-grid, .recipes-grid, .blog-grid, .categories-grid');
  
  containers.forEach(container => {
    const items = container.children;
    Array.from(items).forEach((item, index) => {
      if (index < 6) { // İlk 6 element için
        item.classList.add('stagger-item');
      }
    });
  });
}

// Pattern background ekle
function addPatternBackgrounds() {
  const sections = document.querySelectorAll('.about-content, .features-section, .contribute-section');
  
  sections.forEach((section, index) => {
    if (index % 2 === 0) {
      section.classList.add('pattern-dots');
    } else {
      section.classList.add('pattern-grid');
    }
  });
}

// Floating animation ekle
function addFloatingAnimations() {
  const floatingElements = document.querySelectorAll('.category-icon, .feature-icon');
  
  floatingElements.forEach(element => {
    element.classList.add('floating');
  });
}

// Animated underline ekle
function addAnimatedUnderlines() {
  const links = document.querySelectorAll('.nav-links a, .footer-links a');
  
  links.forEach(link => {
    if (!link.classList.contains('btn')) {
      link.classList.add('animated-underline');
    }
  });
}

// Hero bölümüne parallax efekti ekle
function initParallax() {
  const parallaxElements = document.querySelectorAll('.hero, .page-hero');
  
  if (parallaxElements.length === 0) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        parallaxElements.forEach(element => {
          const scrolled = window.pageYOffset;
          const rate = scrolled * 0.5;
          element.style.transform = `translate3d(0, ${rate}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

// Gradient animasyonlu başlıklar
function addGradientTextAnimations() {
  const headings = document.querySelectorAll('h1, .hero-content h1, .page-hero h1');
  
  headings.forEach(heading => {
    if (heading.textContent.length > 0) {
      heading.classList.add('text-gradient-animate');
    }
  });
}

// Butonlara bounce animasyonu ekle
function addButtonAnimations() {
  const buttons = document.querySelectorAll('.btn, .cta-button, .carousel-btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.classList.add('pulse');
    });
    
    button.addEventListener('mouseleave', () => {
      button.classList.remove('pulse');
    });
  });
}

// İmage lazy loading ve fade-in efekti
function initImageEffects() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });
}

// Smooth scroll davranışını geliştir
function enhanceSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Tüm efektleri başlat
function initAllEffects() {
  initScrollReveal();
  enhanceCardEffects();
  initStaggerAnimations();
  addPatternBackgrounds();
  addFloatingAnimations();
  addAnimatedUnderlines();
  initParallax();
  addGradientTextAnimations();
  addButtonAnimations();
  initImageEffects();
  enhanceSmoothScroll();
}

// Sayfa yüklendiğinde tüm efektleri başlat
document.addEventListener('DOMContentLoaded', function() {
  // Küçük bir gecikme ile başlat (diğer fonksiyonların yüklenmesini bekle)
  setTimeout(() => {
    initAllEffects();
  }, 100);
});

// Resize olayını dinle ve bazı efektleri yeniden hesapla
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initScrollReveal();
  }, 250);
});

/* ============================================
   PARTICLE EFFECTS SYSTEM
   Dinamik parçacık sistemi
   ============================================ */

// Particle Effects'i başlat
function initParticleEffects() {
  // Particle container oluştur
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles-container';
  document.body.appendChild(particlesContainer);
  
  // Animated background overlay ekle
  const bgOverlay = document.createElement('div');
  bgOverlay.className = 'animated-background-overlay';
  document.body.insertBefore(bgOverlay, document.body.firstChild);
  
  // Side glow effects ekle
  const glowLeft = document.createElement('div');
  glowLeft.className = 'side-glow-left';
  document.body.appendChild(glowLeft);
  
  const glowRight = document.createElement('div');
  glowRight.className = 'side-glow-right';
  document.body.appendChild(glowRight);
  
  // Decorative shapes container
  const shapesContainer = document.createElement('div');
  shapesContainer.className = 'decorative-shapes';
  document.body.appendChild(shapesContainer);
  
  // Particle sayısı (mobilde daha az, daha sürekli akış için artırıldı)
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 30 : 80;
  const shapeCount = isMobile ? 6 : 15;
  
  // Particle'ları oluştur
  for (let i = 0; i < particleCount; i++) {
    createParticle(particlesContainer, i);
  }
  
  // Decorative shapes oluştur
  for (let i = 0; i < shapeCount; i++) {
    createDecorativeShape(shapesContainer, i);
  }
}

// Tek bir particle oluştur
function createParticle(container, index) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Random boyut
  const sizes = ['small', 'medium', 'large'];
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
  particle.classList.add(randomSize);
  
  // Random renk
  const colors = ['green', 'dark-green', 'ocean'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  particle.classList.add(randomColor);
  
  // Random başlangıç pozisyonu
  const randomX = Math.random() * 100;
  particle.style.left = randomX + '%';
  
  // Random X hareketi
  const randomXMovement = (Math.random() - 0.5) * 200;
  particle.style.setProperty('--x-movement', randomXMovement + 'px');
  
  // Random animasyon süresi (daha hızlı - daha smooth)
  const duration = 8 + Math.random() * 12; // 8-20 saniye
  particle.style.animationDuration = duration + 's';
  
  // Random başlangıç gecikmesi (daha kısa - daha fazla overlap)
  const delay = Math.random() * 5;
  particle.style.animationDelay = delay + 's';
  
  container.appendChild(particle);
}

// Dekoratif şekil oluştur
function createDecorativeShape(container, index) {
  const shape = document.createElement('div');
  shape.className = 'shape';
  
  // Random şekil tipi
  const shapes = ['circle', 'square', 'triangle'];
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  shape.classList.add(randomShape);
  
  // Random boyut
  const size = 30 + Math.random() * 50;
  if (randomShape !== 'triangle') {
    shape.style.width = size + 'px';
    shape.style.height = size + 'px';
  }
  
  // Random başlangıç pozisyonu
  const randomX = Math.random() * 100;
  shape.style.left = randomX + '%';
  
  // Random rotasyon
  const rotation = Math.random() * 360;
  shape.style.setProperty('--rotation', rotation + 'deg');
  
  // Random animasyon süresi (daha hızlı)
  const duration = 12 + Math.random() * 18; // 12-30 saniye
  shape.style.animationDuration = duration + 's';
  
  // Random başlangıç gecikmesi (daha kısa)
  const delay = Math.random() * 8;
  shape.style.animationDelay = delay + 's';
  
  container.appendChild(shape);
}

// Mouse takip eden parçacık efekti
function initMouseParticles() {
  if (window.innerWidth < 768) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let particles = [];
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Her hareket için yeni bir parçacık oluştur (daha sık)
    if (Math.random() > 0.85) {
      createMouseParticle(mouseX, mouseY);
    }
  });
}

function createMouseParticle(x, y) {
  const particle = document.createElement('div');
  particle.style.position = 'fixed';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.width = '6px';
  particle.style.height = '6px';
  particle.style.borderRadius = '50%';
  particle.style.background = 'var(--light-green)';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';
  particle.style.opacity = '0.8';
  particle.style.transition = 'all 1.2s ease-out';
  particle.style.boxShadow = '0 0 15px rgba(107, 158, 61, 0.8)';
  
  document.body.appendChild(particle);
  
  // Animasyon
  setTimeout(() => {
    particle.style.opacity = '0';
    particle.style.transform = 'translateY(-30px) scale(2.5)';
  }, 10);
  
  // Temizlik
  setTimeout(() => {
    particle.remove();
  }, 1200);
}

// Scroll'a göre parçacık hızını değiştir
function initScrollBasedParticles() {
  let lastScrollY = window.scrollY;
  let scrollTimeout;
  
  window.addEventListener('scroll', () => {
    const scrollSpeed = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    
    // Hızlı scroll'da parçacıkları hızlandır
    if (scrollSpeed > 3) {
      clearTimeout(scrollTimeout);
      
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => {
        const currentDuration = parseFloat(particle.style.animationDuration);
        particle.style.animationDuration = (currentDuration * 0.7) + 's';
      });
      
      // 2 saniye sonra normale dön
      scrollTimeout = setTimeout(() => {
        particles.forEach(particle => {
          const currentDuration = parseFloat(particle.style.animationDuration);
          particle.style.animationDuration = (currentDuration / 0.7) + 's';
        });
      }, 2000);
    }
  });
}

// Tüm particle sistemlerini başlat
function initAllParticleSystems() {
  initParticleEffects();
  initMouseParticles();
  initScrollBasedParticles();
}

// Particle sistemini sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    initAllParticleSystems();
  }, 500);
});

/* ============================================
   MOBILE OPTIMIZATIONS
   Mobil Optimizasyonları
   ============================================ */

// Mobil cihaz kontrolü
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Touch event desteği kontrolü
function hasTouchSupport() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Viewport boyutu
function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
}

// Mobil viewport height fix (iOS Safari için)
function setMobileVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Touch-friendly hover efektleri
function initTouchHover() {
  if (!hasTouchSupport()) return;
  
  const hoverElements = document.querySelectorAll('.dish-card, .recipe-card, .blog-card, .category-card, .btn');
  
  hoverElements.forEach(element => {
    element.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    });
    
    element.addEventListener('touchend', function() {
      setTimeout(() => {
        this.classList.remove('touch-active');
      }, 300);
    });
  });
}

// Prevent double-tap zoom on buttons
function preventDoubleTapZoom() {
  if (!isMobileDevice()) return;
  
  const buttons = document.querySelectorAll('button, .btn, a');
  let lastTouchEnd = 0;
  
  buttons.forEach(button => {
    button.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  });
}

// Smooth scroll for mobile
function initMobileSmoothScroll() {
  if (!isMobileDevice()) return;
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 70;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Lazy load images for mobile
function initMobileLazyLoading() {
  if (!('IntersectionObserver' in window)) return;
  
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Optimize carousel for touch
function optimizeCarouselForTouch() {
  if (!hasTouchSupport()) return;
  
  const carousels = document.querySelectorAll('.hero-carousel, .dishes-carousel-container');
  
  carousels.forEach(carousel => {
    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;
    let threshold = 50; // Minimum distance for swipe
    
    carousel.addEventListener('touchstart', function(e) {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
    }, false);
    
    carousel.addEventListener('touchmove', function(e) {
      distX = e.touches[0].pageX - startX;
      distY = e.touches[0].pageY - startY;
      
      // Prevent vertical scroll if horizontal swipe
      if (Math.abs(distX) > Math.abs(distY)) {
        e.preventDefault();
      }
    }, { passive: false });
    
    carousel.addEventListener('touchend', function(e) {
      if (Math.abs(distX) > threshold) {
        if (distX > 0) {
          // Swipe right - previous
          const prevBtn = this.parentElement.querySelector('.carousel-btn-prev, .dishes-carousel-prev');
          if (prevBtn) prevBtn.click();
        } else {
          // Swipe left - next
          const nextBtn = this.parentElement.querySelector('.carousel-btn-next, .dishes-carousel-next');
          if (nextBtn) nextBtn.click();
        }
      }
      distX = 0;
      distY = 0;
    }, false);
  });
}

// Improve form inputs for mobile
function improveMobileFormInputs() {
  if (!isMobileDevice()) return;
  
  // Add proper input types for mobile keyboards
  const emailInputs = document.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.setAttribute('autocomplete', 'email');
    input.setAttribute('inputmode', 'email');
  });
  
  const telInputs = document.querySelectorAll('input[type="tel"]');
  telInputs.forEach(input => {
    input.setAttribute('autocomplete', 'tel');
    input.setAttribute('inputmode', 'tel');
  });
  
  const numberInputs = document.querySelectorAll('input[type="number"]');
  numberInputs.forEach(input => {
    input.setAttribute('inputmode', 'numeric');
  });
  
  // Prevent zoom on input focus (iOS)
  const allInputs = document.querySelectorAll('input, textarea, select');
  allInputs.forEach(input => {
    if (input.style.fontSize === '' || parseFloat(input.style.fontSize) < 16) {
      input.style.fontSize = '16px';
    }
  });
}

// Optimize modal for mobile
function optimizeMobileModals() {
  const modals = document.querySelectorAll('.modal, .recipe-modal, .auth-modal');
  
  modals.forEach(modal => {
    // Prevent body scroll when modal is open
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          if (modal.classList.contains('active') || modal.style.display === 'flex') {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
          } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
          }
        }
      });
    });
    
    observer.observe(modal, { attributes: true });
  });
}

// Handle orientation change
function handleOrientationChange() {
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      setMobileVH();
      // Refresh carousel positions
      if (typeof showSlide === 'function') {
        const currentSlide = document.querySelector('.carousel-slide.active');
        if (currentSlide) {
          const index = Array.from(currentSlide.parentElement.children).indexOf(currentSlide);
          showSlide(index);
        }
      }
    }, 100);
  });
}

// Optimize performance for mobile
function optimizeMobilePerformance() {
  if (!isMobileDevice()) return;
  
  // Reduce particle count on low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
      if (index % 2 === 0) {
        particle.style.display = 'none';
      }
    });
  }
  
  // Disable some animations on slow connections
  if (navigator.connection && navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g') {
    document.body.classList.add('reduce-motion');
  }
}

// Pull to refresh (disable on iOS Safari)
function disablePullToRefresh() {
  if (!isMobileDevice()) return;
  
  let startY = 0;
  
  document.addEventListener('touchstart', function(e) {
    startY = e.touches[0].pageY;
  }, { passive: true });
  
  document.addEventListener('touchmove', function(e) {
    const y = e.touches[0].pageY;
    // Disable if pulling down at the top
    if (window.scrollY === 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Tüm mobil optimizasyonları başlat
function initAllMobileOptimizations() {
  setMobileVH();
  initTouchHover();
  preventDoubleTapZoom();
  initMobileSmoothScroll();
  initMobileLazyLoading();
  optimizeCarouselForTouch();
  improveMobileFormInputs();
  optimizeMobileModals();
  handleOrientationChange();
  optimizeMobilePerformance();
  disablePullToRefresh();
  
  // Viewport resize için
  window.addEventListener('resize', setMobileVH);
}

// Mobil optimizasyonları başlat
document.addEventListener('DOMContentLoaded', function() {
  initAllMobileOptimizations();
});

