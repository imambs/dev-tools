(() => {
  async function injectElement(mount, url) {
    if (!mount || !url) return;
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
    mount.innerHTML = await response.text();
  }

  async function inject(selector, url) {
    return injectElement(document.querySelector(selector), url);
  }

  function setOpenSidebarSection(collapseEl) {
    const sidebar = document.getElementById('sidebarNav');
    if (!sidebar || !collapseEl) return;

    sidebar.querySelectorAll(':scope > .collapse').forEach(section => {
      section.classList.toggle('show', section === collapseEl);
    });

    sidebar.querySelectorAll(':scope > .nav-section').forEach(button => {
      const target = button.getAttribute('data-bs-target');
      const isOpen = target === `#${collapseEl.id}`;
      button.classList.toggle('active', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function markActiveNavigation() {
    const activeId = document.body.dataset.activeNav || 'home';
    const links = [...document.querySelectorAll('[data-nav-id]')];

    links.forEach(link => {
      link.classList.toggle('active', link.dataset.navId === activeId);
    });

    // Dashboard always opens Development by default. Tool pages open the
    // section that contains the current tool, so the useful menu stays visible.
    let sectionToOpen = document.getElementById('developmentMenu');

    if (activeId !== 'home') {
      const activeLink = links.find(link => link.dataset.navId === activeId);
      const parentSection = activeLink?.closest('.collapse');
      if (parentSection) sectionToOpen = parentSection;
    }

    if (sectionToOpen) setOpenSidebarSection(sectionToOpen);
  }

  async function loadLayout() {
    try {
      const repeatableComponents = [...document.querySelectorAll('[data-component-src]')]
        .map(mount => injectElement(mount, mount.dataset.componentSrc));

      await Promise.all([
        inject('#sidebarMount', '/components/sidebar.html'),
        inject('#topbarMount', '/components/topbar.html'),
        inject('#headerAdMount', '/components/header-ad.html'),
        inject('#footerAdMount', '/components/footer-ad.html'),
        inject('#footerMount', '/components/footer.html'),
        inject('#scrollControlsMount', '/components/scroll-controls.html'),
        ...repeatableComponents
      ]);

      markActiveNavigation();
      document.dispatchEvent(new CustomEvent('devkit:layout-ready'));
    } catch (error) {
      console.error(error);
      document.body.classList.add('layout-load-error');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLayout, { once: true });
  } else {
    loadLayout();
  }
})();
