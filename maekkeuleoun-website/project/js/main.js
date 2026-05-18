/* ═══════════════════════════════════════════════════════
   MAEKKEULEOUN — main.js
   Handles: navbar, mobile menu, products, testimonials,
            filtering, scroll animations, slider
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────
     1. NAVBAR — scroll shrink & active link
  ────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load

  // Highlight current page nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  /* ──────────────────────────────────────────────────────
     2. MOBILE MENU
  ────────────────────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');
  const overlay     = document.getElementById('mobileOverlay');

  const openMenu  = () => { hamburger.classList.add('open'); navLinks.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { hamburger.classList.remove('open'); navLinks.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; };

  if (hamburger) hamburger.addEventListener('click', () => hamburger.classList.contains('open') ? closeMenu() : openMenu());
  if (overlay)   overlay.addEventListener('click', closeMenu);

  // Close menu when a nav link is tapped on mobile
  document.querySelectorAll('.nav-link, .nav-cta').forEach(l => l.addEventListener('click', closeMenu));

  /* ──────────────────────────────────────────────────────
     3. LOAD PRODUCT DATA FROM JSON
  ────────────────────────────────────────────────────── */
  let allProducts = [];

  const fetchProducts = async () => {
    try {
      const res  = await fetch('data/products.json');
      const data = await res.json();
      allProducts = data.products || [];
      return data;
    } catch (e) {
      console.warn('Could not fetch products.json, using fallback.', e);
      return { products: [], testimonials: [] };
    }
  };

  /* ──────────────────────────────────────────────────────
     4. RENDER FEATURED PRODUCT CARDS (index.html)
  ────────────────────────────────────────────────────── */
  const renderFeaturedGrid = (products) => {
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;

    grid.innerHTML = products.filter(p => p.featured).map(p => `
      <div class="product-card scroll-reveal">
        <div class="product-card-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <span class="product-card-badge">${p.category}</span>
        </div>
        <div class="product-card-body">
          <p class="product-card-category">${p.category}</p>
          <h3 class="product-card-name">${p.name}</h3>
          <p class="product-card-tagline">${p.tagline}</p>
          <p class="product-card-desc">${p.short_description}</p>
          <div class="product-card-actions">
            <a href="${p.links.shopee}" target="_blank" class="btn btn-shopee">Shopee</a>
            <a href="${p.links.lazada}" target="_blank" class="btn btn-lazada">Lazada</a>
          </div>
        </div>
      </div>
    `).join('');

    initScrollReveal(); // re-run after DOM update
  };

  /* ──────────────────────────────────────────────────────
     5. RENDER FULL PRODUCTS PAGE (products.html)
  ────────────────────────────────────────────────────── */
  const renderProductsPage = (products, filter = 'All') => {
    const grid = document.getElementById('productsFullGrid');
    if (!grid) return;

    const filtered = filter === 'All'
      ? products
      : products.filter(p => p.category === filter);

    grid.innerHTML = filtered.map(p => `
      <div class="product-full-card scroll-reveal" data-category="${p.category}">
        <div class="product-full-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product-full-body">
          <p class="section-eyebrow">${p.category}</p>
          <h3>${p.name}</h3>
          <p class="product-full-tagline">${p.tagline}</p>
          <p class="product-full-desc">${p.description}</p>
          <ul class="product-benefits">
            ${p.benefits.map(b => `<li>${b}</li>`).join('')}
          </ul>
          <div class="product-full-actions">
            <a href="${p.links.shopee}" target="_blank" class="btn btn-shopee">Shop on Shopee</a>
            <a href="${p.links.lazada}" target="_blank" class="btn btn-lazada">Shop on Lazada</a>
          </div>
        </div>
      </div>
    `).join('');

    initScrollReveal();
  };

  /* ──────────────────────────────────────────────────────
     6. PRODUCT FILTERING (products.html)
  ────────────────────────────────────────────────────── */
  const initFiltering = (products) => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProductsPage(products, btn.dataset.filter);
      });
    });
  };

  /* ──────────────────────────────────────────────────────
     7. TESTIMONIALS SLIDER
  ────────────────────────────────────────────────────── */
  const renderTestimonials = (testimonials) => {
    const slider = document.getElementById('testimonialsSlider');
    const dots   = document.getElementById('sliderDots');
    if (!slider || !testimonials.length) return;

    slider.innerHTML = testimonials.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-quote">"</div>
        <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="author-info">
            <strong>${t.name}</strong>
            <span>${t.location}</span>
          </div>
          <span class="testimonial-product">${t.product}</span>
        </div>
      </div>
    `).join('');

    // Dots
    const pairCount = Math.ceil(testimonials.length / 2);
    dots.innerHTML = Array.from({ length: pairCount }, (_, i) =>
      `<button class="slider-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');

    let currentSlide = 0;
    const isMobile   = () => window.innerWidth <= 768;
    const getVisible  = () => isMobile() ? 1 : 2;

    const goTo = (idx) => {
      const visible   = getVisible();
      const maxSlide  = Math.max(0, testimonials.length - visible);
      currentSlide    = Math.min(idx, maxSlide);
      const cardW     = slider.querySelector('.testimonial-card').offsetWidth;
      const gap       = 32;
      slider.style.transform = `translateX(-${currentSlide * (cardW + gap)}px)`;
      dots.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === Math.floor(currentSlide / visible));
      });
    };

    dots.querySelectorAll('.slider-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const visible = getVisible();
        goTo(parseInt(dot.dataset.index) * visible);
      });
    });

    // Auto-slide
    let autoplay = setInterval(() => {
      const visible  = getVisible();
      const maxSlide = Math.max(0, testimonials.length - visible);
      goTo(currentSlide >= maxSlide ? 0 : currentSlide + visible);
    }, 5000);

    slider.addEventListener('mouseenter', () => clearInterval(autoplay));
    slider.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => {
        const visible  = getVisible();
        const maxSlide = Math.max(0, testimonials.length - visible);
        goTo(currentSlide >= maxSlide ? 0 : currentSlide + visible);
      }, 5000);
    });

    // Touch swipe
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    });
  };

  /* ──────────────────────────────────────────────────────
     8. SCROLL REVEAL (IntersectionObserver)
  ────────────────────────────────────────────────────── */
  const initScrollReveal = () => {
    const targets = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80); // stagger
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  };

  /* ──────────────────────────────────────────────────────
     9. CONTACT FORM
  ────────────────────────────────────────────────────── */
  const initContactForm = () => {
    const form    = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.form-submit');
      btn.textContent = 'Sending…';
      btn.disabled    = true;

      // Simulate send (real project would POST to backend/emailjs)
      setTimeout(() => {
        form.style.display = 'none';
        if (success) success.classList.add('show');
      }, 1500);
    });
  };

  /* ──────────────────────────────────────────────────────
     10. SMOOTH SCROLL for anchor links
  ────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  /* ──────────────────────────────────────────────────────
     11. GALLERY LIGHTBOX (simple)
  ────────────────────────────────────────────────────── */
  const initGallery = () => {
    const items = document.querySelectorAll('.gallery-item');
    if (!items.length) return;

    // Create lightbox
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.innerHTML = `
      <div class="lb-backdrop"></div>
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">‹</button>
      <button class="lb-next" aria-label="Next">›</button>
      <div class="lb-img-wrap"><img id="lbImg" src="" alt="" /></div>
    `;
    lb.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);align-items:center;justify-content:center;';
    document.body.appendChild(lb);

    const lbImg   = lb.querySelector('#lbImg');
    const lbClose = lb.querySelector('.lb-close');
    const imgSrcs = Array.from(items).map(item => item.querySelector('img').src);
    let current   = 0;

    const openLb = (i) => {
      current = i;
      lbImg.src = imgSrcs[i];
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    };
    const closeLb = () => { lb.style.display = 'none'; document.body.style.overflow = ''; };

    items.forEach((item, i) => item.addEventListener('click', () => openLb(i)));
    lbClose.addEventListener('click', closeLb);
    lb.querySelector('.lb-backdrop').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', () => openLb((current - 1 + imgSrcs.length) % imgSrcs.length));
    lb.querySelector('.lb-next').addEventListener('click', () => openLb((current + 1) % imgSrcs.length));

    document.addEventListener('keydown', e => {
      if (lb.style.display !== 'flex') return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft')  lb.querySelector('.lb-prev').click();
      if (e.key === 'ArrowRight') lb.querySelector('.lb-next').click();
    });

    // Inline lightbox styles
    const style = document.createElement('style');
    style.textContent = `
      #lightbox img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 8px; }
      .lb-close { position:absolute;top:1.5rem;right:1.5rem;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:1.4rem;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px); }
      .lb-prev, .lb-next { position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:2.5rem;width:52px;height:52px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px); }
      .lb-prev { left:1.5rem; }
      .lb-next { right:1.5rem; }
      .lb-backdrop { position:absolute;inset:0; }
      .lb-img-wrap { position:relative;z-index:1; }
    `;
    document.head.appendChild(style);
  };

  /* ──────────────────────────────────────────────────────
     INIT — run everything
  ────────────────────────────────────────────────────── */
  (async () => {
    const data = await fetchProducts();

    renderFeaturedGrid(data.products || []);
    renderProductsPage(data.products || []);
    initFiltering(data.products || []);
    renderTestimonials(data.testimonials || []);

    initScrollReveal();
    initContactForm();
    initGallery();

    // Add scroll-reveal classes to generic sections
    document.querySelectorAll('.value-card, .gallery-item, .shop-card').forEach(el => {
      if (!el.classList.contains('scroll-reveal')) el.classList.add('scroll-reveal');
    });
    initScrollReveal();
  })();

});
