// Session Check - Add to all admin pages
(function() {
  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  const currentPage = window.location.pathname.split('/').pop();

  // If not logged in and not on admin-web.html, redirect
  if (!isLoggedIn && currentPage !== 'admin-web.html' && currentPage !== '') {
    window.location.href = 'admin-web.html';
  }
})();
