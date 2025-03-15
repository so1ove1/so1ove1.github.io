document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('main-header');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });

  // Toggle mobile menu
  mobileMenuToggle.addEventListener('click', function () {
    mobileMenu.classList.toggle("display");

    const menuIcon = mobileMenuToggle.querySelector('svg');

    if (mobileMenu.classList.contains('display')) {
      // X
      menuIcon.innerHTML = `
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        `;
      // Hamburger
    } else {
      menuIcon.innerHTML = `
          <line x1="4" x2="20" y1="12" y2="12"/>
          <line x1="4" x2="20" y1="6" y2="6"/>
          <line x1="4" x2="20" y1="18" y2="18"/>
        `;
    }
  });

  // Close mobile menu when a link is clicked
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
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
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
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

  // Binary background animation
  const binaryBackground = document.getElementById("binary-background")
  if (binaryBackground) {
    createBinaryAnimation(binaryBackground)
  }

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  function createBinaryAnimation(container) {
    // Number of binary digits to create
    const digitCount = 10
  
    // Create binary digits
    for (let i = 0; i < digitCount; i++) {
      createBinaryDigit(container)
    }
  
    // Continue creating digits at intervals
    setInterval(() => {
      if (document.visibilityState === "visible") {
        createBinaryDigit(container)
      }
    }, 200)
  }
  
  function createBinaryDigit(container) {
    // Create a new element for the binary digit
    const digit = document.createElement("div")
    digit.className = "binary-digit"
  
    // Randomly choose 0 or 1
    digit.textContent = Math.random() > 0.5 ? "0" : "1"
  
    // Random position, size, and animation duration
    const size = Math.floor(Math.random() * 30) + 20 // 20-50px
    const left = Math.random() * 100 // 0-100%
    const animationDuration = Math.random() * 10 + 10 // 10-20s
    const delay = Math.random() * 3 // 0-5s
  
    // Apply styles
    digit.style.fontSize = `${size}px`
    digit.style.left = `${left}%`
    digit.style.bottom = "-50px"
    digit.style.animationDuration = `${animationDuration}s`
    digit.style.animationDelay = `${delay}s`
  
    // Add to container
    container.appendChild(digit)
  
    // Remove after animation completes
    setTimeout(
      () => {
        if (container.contains(digit)) {
          container.removeChild(digit)
        }
      },
      (animationDuration + delay) * 1000,
    )
  }

})

