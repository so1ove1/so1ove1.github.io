document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('main-header');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    });
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      
      const menuIcon = mobileMenuToggle.querySelector('svg');
      
      if (mobileMenu.classList.contains('hidden')) {
        // Hamburger
        menuIcon.innerHTML = `
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        `;
      } else {
        // X
        menuIcon.innerHTML = `
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        `;
      }
    });
    
    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        
        // Reset to hamburger
        const menuIcon = mobileMenuToggle.querySelector('svg');
        menuIcon.innerHTML = `
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        `;
      });
    });
  
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 70, // Offset for the fixed header
            behavior: 'smooth'
          });
        }
      });
    });
  });
  