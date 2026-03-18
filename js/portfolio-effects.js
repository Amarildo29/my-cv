window.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hide-on-scroll navbar (with threshold to avoid jitter)
  const nav = document.getElementById('navbar');
  let lastY = window.scrollY;
  const threshold = 8;
  if (nav) {
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        if (y > lastY + threshold && y > 80) {
          nav.classList.add('hidden');
        } else if (y < lastY - threshold) {
          nav.classList.remove('hidden');
        }
        lastY = y;
      },
      { passive: true }
    );
  }

  // Reading progress indicator
  const progress = document.createElement('div');
  progress.className = 'portfolio-progress';
  document.body.appendChild(progress);

  const updateProgress = () => {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  // Dark mode toggle (persist in localStorage)
  const root = document.body;
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    root.setAttribute('data-bs-theme', savedTheme);
    if (icon) {
      icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-bs-theme', nextTheme);
      if (icon) {
        icon.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
      }
      localStorage.setItem('theme', nextTheme);
    });
  }

  // Project reveal, filtering, and tilt effects
  const projectGrid = document.getElementById('projects');
  if (!projectGrid) {
    return;
  }

  const projectItems = Array.from(projectGrid.querySelectorAll(':scope > .col'));
  const searchInput = document.getElementById('projectSearch');
  const chips = Array.from(document.querySelectorAll('.filter-chip'));
  const countEl = document.getElementById('projectCount');
  const noResultsEl = document.getElementById('noResultsMsg');

  const categoryRules = {
    video: [
      'video',
      'vods',
      'chemistry in motion',
      'polarity',
      'lewis structures',
      'mechanisms',
    ],
    automation: ['bot', 'scraping', 'scraper', 'password manager', 'automation'],
    web: [
      'calculator',
      'platform',
      'portfolio',
      'blog',
      'web',
      'shop',
      'tic tac toe',
      'game',
      'webfood',
      'certificate',
      'flashcard',
      'informatest',
      'milano',
    ],
  };

  const inferCategories = (searchText) => {
    const categories = new Set();
    Object.entries(categoryRules).forEach(([category, words]) => {
      if (words.some((word) => searchText.includes(word))) {
        categories.add(category);
      }
    });

    if (categories.size === 0) {
      categories.add('web');
    }

    return Array.from(categories);
  };

  projectItems.forEach((item, index) => {
    item.classList.add('project-item');
    item.style.setProperty('--item-delay', `${Math.min(index, 10) * 45}ms`);

    const title = item.querySelector('.card-title')?.textContent?.trim() || '';
    const alt = item.querySelector('img')?.getAttribute('alt') || '';
    const searchText = `${title} ${alt}`.toLowerCase();
    const categories = inferCategories(searchText);

    item.dataset.search = searchText;
    item.dataset.category = categories.join(' ');
  });

  let activeFilter = 'all';

  const applyFilters = () => {
    const query = searchInput?.value?.trim().toLowerCase() || '';
    let visibleCount = 0;

    projectItems.forEach((item) => {
      const categories = item.dataset.category?.split(' ') || [];
      const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
      const matchesSearch = query.length === 0 || item.dataset.search.includes(query);
      const isVisible = matchesFilter && matchesSearch;

      item.classList.toggle('is-hidden', !isVisible);
      item.setAttribute('aria-hidden', String(!isVisible));

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (countEl) {
      countEl.textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'} shown`;
    }

    if (noResultsEl) {
      noResultsEl.hidden = visibleCount > 0;
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter || 'all';
      chips.forEach((node) => node.classList.toggle('is-active', node === chip));
      applyFilters();
    });
  });

  applyFilters();

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    projectItems.forEach((item) => revealObserver.observe(item));
  } else {
    projectItems.forEach((item) => item.classList.add('is-visible'));
  }

  if (!prefersReducedMotion) {
    const cards = Array.from(projectGrid.querySelectorAll('.card'));
    cards.forEach((card) => {
      const resetTilt = () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--card-rotate-x', '0deg');
        card.style.setProperty('--card-rotate-y', '0deg');
        card.style.setProperty('--card-glow-x', '50%');
        card.style.setProperty('--card-glow-y', '45%');
      };

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const ratioX = offsetX / rect.width - 0.5;
        const ratioY = offsetY / rect.height - 0.5;

        const rotateY = ratioX * 8;
        const rotateX = ratioY * -8;

        card.classList.add('is-tilting');
        card.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
        card.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
        card.style.setProperty('--card-glow-x', `${offsetX.toFixed(0)}px`);
        card.style.setProperty('--card-glow-y', `${offsetY.toFixed(0)}px`);
      });

      card.addEventListener('pointerleave', resetTilt);
      card.addEventListener('pointercancel', resetTilt);
    });
  }

  // Keep footer year current
  const footerText = document.querySelector('footer .container');
  if (footerText) {
    footerText.textContent = `© Amarildo Kociaj ${new Date().getFullYear()}`;
  }
});
