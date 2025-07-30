document.addEventListener('DOMContentLoaded', function () {
  const openNavBtn = document.getElementById('openNavBtn');
  const closeNavBtn = document.getElementById('closeNavBtn');
  const myOverlayNav = document.getElementById('myOverlayNav');
  const overlayContent = document.querySelector('.overlay-content');

  openNavBtn.addEventListener('click', function () {
    myOverlayNav.style.width = '45%';
    openNavBtn.style.display = 'none';
  });

  closeNavBtn.addEventListener('click', function () {
    myOverlayNav.style.width = '0%';
    openNavBtn.style.display = 'block';
  });

  window.addEventListener('click', function (e) {
    const isClickInside = overlayContent.contains(e.target);
    const isNavOpen = myOverlayNav.style.width !== '0%' && myOverlayNav.style.width !== '';
    if (!isClickInside && isNavOpen && e.target !== openNavBtn && e.target !== closeNavBtn) {
      myOverlayNav.style.width = '0%';
      openNavBtn.style.display = 'block';
    }
  });

  // ✅ AUTH LOGIC
  const authLink = document.getElementById('authLink');

  function renderAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      authLink.textContent = 'Log Out';
      authLink.href = '#';
      authLink.addEventListener('click', function () {
        localStorage.removeItem('isLoggedIn');
        location.reload(); // refresh biar navbar kembali ke login
      });
    } else {
      authLink.textContent = 'Log In/Register';
      authLink.href = 'pilihan.html';
    }
  }

  renderAuthStatus();
});
