(() => {
  /*
   * Add your real Google AdSense IDs here after AdSense gives them to you.
   * Keep the empty strings while designing/testing locally; placeholders remain visible.
   * Example client format: ca-pub-1234567890123456
   */
  const ADSENSE = {
    client: '',
    slots: {
      header: '',
      dashboard: '',
      footer: ''
    }
  };

  const isValidClient = value => /^ca-pub-\d+$/.test(value || '');
  const isValidSlot = value => /^\d+$/.test(value || '');

  function loadAdSenseScript() {
    if (!isValidClient(ADSENSE.client)) return false;
    if (document.querySelector('script[data-devkit-adsense]')) return true;

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.devkitAdsense = 'true';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE.client)}`;
    document.head.appendChild(script);
    return true;
  }

  function renderAdSlots() {
    if (!loadAdSenseScript()) return;

    document.querySelectorAll('[data-adsense-placement]').forEach(slotHost => {
      if (slotHost.dataset.adsenseInitialized === '1') return;

      const placement = slotHost.dataset.adsensePlacement;
      const slotId = ADSENSE.slots[placement];
      if (!isValidSlot(slotId)) return;

      const ad = document.createElement('ins');
      ad.className = 'adsbygoogle';
      ad.style.display = 'block';
      ad.style.width = '100%';
      ad.dataset.adClient = ADSENSE.client;
      ad.dataset.adSlot = slotId;
      ad.dataset.adFormat = 'auto';
      ad.dataset.fullWidthResponsive = 'true';

      slotHost.innerHTML = '';
      slotHost.appendChild(ad);
      slotHost.classList.add('adsense-ready');
      slotHost.dataset.adsenseInitialized = '1';

      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    });
  }

  document.addEventListener('devkit:layout-ready', renderAdSlots);

  if (document.readyState !== 'loading') {
    renderAdSlots();
  }
})();
