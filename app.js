/* MOADE Associates — Interface & Interactive Behaviors */

(function () {
  'use strict';

  /* 1. Header scroll effect ------------------------------------------------ */
  var header = document.getElementById('site-header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* 2. Mobile navigation menu ---------------------------------------------- */
  var menu = document.getElementById('mobile-menu');
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');

  function openMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
  }

  if (menu) {
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* 3. Modal System (Join Us, Speak to Lawyer, Privacy, Terms) ------------- */
  var activeModal = null;

  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    closeMenu();
    if (activeModal && activeModal !== modal) {
      closeModal(activeModal);
    }
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    activeModal = modal;
    var firstInput = modal.querySelector('input, textarea, select, button');
    if (firstInput) firstInput.focus();
  }

  function closeModal(modal) {
    if (!modal) modal = activeModal;
    if (!modal) return;
    modal.classList.remove('open');
    activeModal = null;
    if (!document.querySelector('.modal-backdrop.open')) {
      document.body.classList.remove('modal-open');
    }
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = btn.getAttribute('data-open-modal');
      openModal(targetId);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal();
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (activeModal) closeModal(activeModal);
      if (menu && menu.classList.contains('open')) closeMenu();
    }
  });

  /* 4. Number Counters ----------------------------------------------------- */
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    var counted = false;
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        counters.forEach(function (el) {
          var target = parseInt(el.getAttribute('data-counter'), 10) || 0;
          var duration = 1600;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              el.textContent = target;
            }
          }
          window.requestAnimationFrame(step);
        });
      }
    }, { threshold: 0.15 });

    counters.forEach(function (c) {
      observer.observe(c);
    });
  }

  /* 5. Services Horizontal Carousel Scroll --------------------------------- */
  var servicesTrack = document.getElementById('services-track');
  var servicesPrev = document.getElementById('services-prev');
  var servicesNext = document.getElementById('services-next');

  if (servicesTrack && servicesPrev && servicesNext) {
    servicesPrev.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: -360, behavior: 'smooth' });
    });
    servicesNext.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: 360, behavior: 'smooth' });
    });
  }

  /* 6. Dynamic Testimonial Slider & Shuffler -------------------------------- */
  var testimonials = [
    {
      author: "Gaise Baba",
      role: "Recording & Performing Artist, Cultural Leader",
      logo: "assets/images/gaise-baba-logo.png",
      quote: "Working with MOADE Associates has been one of the most defining decisions for my organization. Their support goes far beyond legal services, they bring clarity, structure, and strategic insight into every conversation. They understand the heart of my work, the purpose behind it, and the vision ahead. Whether it’s navigating complex agreements, shaping long-term strategy, or managing partnerships, MOADE Associates consistently delivers excellence with sincerity, depth, and precision. What I appreciate most is their ability to simplify complexity without reducing meaning, to protect my interests without stifling creativity, and to advise with both legal mastery and spiritual intelligence. MOADE Associates has become more than a legal partner; they are a trusted counsel and an essential part of how we build, grow, and move with integrity."
    },
    {
      author: "Igwe Nancy",
      role: "Label Manager — BME Records",
      logo: "assets/images/logo-bme-hd.png",
      quote: "At BME Records, we all want to express our sincere gratitude to Moade Associates for the exceptional work they have been doing. Working with Moade Associates has been nothing short of exceptional. Their professionalism, attention to detail, and deep understanding of the entertainment and business landscape have been invaluable to BME Records. From contract drafting to strategic legal advisory, their team has consistently demonstrated a high level of expertise and dedication. We consider them a trusted partner in our growth and operations."
    },
    {
      author: "Artcation Leadership",
      role: "Creative Enterprise & Brand Development",
      logo: "assets/images/logo-artcation.png",
      quote: "Working with MOADE Associates has been one of the most seamless parts of building Artcation. From trademark registration to drafting partnership agreements, their attention to detail and understanding of creative businesses gave us the confidence to grow our brand the right way. They didn’t just handle the legalities, they understood our vision and helped protect it. Every document, every clause reflected the same care we put into our art. Having them on our side has been instrumental in shaping Artcation into the credible, future-ready brand it’s becoming."
    },
    {
      author: "Elara Development Company Limited",
      role: "Real Estate & Infrastructure Development",
      logo: "assets/images/logo-elara.png",
      quote: "Our company has worked with Moade Associates for several years, and their expertise in real estate law has been invaluable. They are highly competent, professional, and consistently deliver effective legal support. Their deep understanding of the real estate sector and proactive approach make them an essential partner in our projects."
    },
    {
      author: "Cloudtoch Integrations",
      role: "Smart Infrastructure & Technology",
      logo: "assets/images/logo-cloudtoch.jpg",
      quote: "Working with MOADE Associates has been a wonderful experience. As we are expanding, we need a reliable legal team. With Moade's level of professionalism and how you handle our business, we have no doubts that we will be working with you for years to come. Thank you."
    },
    {
      author: "Cobalt Media Group",
      role: "Entertainment & Media Production",
      logo: "assets/images/logo-cobolt.jpg",
      quote: "Moade & Associates provided top-notch legal and advisory services for our project. Their expertise and dedication gave us absolute peace of mind throughout our legal and commercial affairs."
    },
    {
      author: "Squared Lab",
      role: "Venture Studio & Digital Acceleration",
      logo: "assets/images/logo-squaredlab.jpg",
      quote: "Their strategic support in corporate governance, contracts, and venture structuring made our business expansion seamless and legally robust."
    },
    {
      author: "Numio Technology",
      role: "Fintech & Product Innovation",
      logo: "assets/images/logo-numio.jpg",
      quote: "Exceptional clarity, responsiveness, and genuine commercial insight in tech compliance and cross-border commercial strategy."
    },
    {
      author: "Ahava Living",
      role: "Hospitality & Lifestyle Brand",
      logo: "assets/images/logo-ahava.jpg",
      quote: "A trustworthy partner who brings diligence and proactive foresight to every agreement. Highly dependable and strategic counsel."
    }
  ];

  var currentIndex = 0;
  var quoteEl = document.getElementById('t-quote');
  var authorEl = document.getElementById('t-author');
  var roleEl = document.getElementById('t-role');
  var logoEl = document.getElementById('t-logo');
  var countEl = document.getElementById('t-count');
  var cardEl = document.getElementById('testimonial-card');
  var autoSlideTimer = null;

  function renderTestimonial(idx) {
    if (!quoteEl || !authorEl || !roleEl || !logoEl) return;
    currentIndex = (idx + testimonials.length) % testimonials.length;
    var item = testimonials[currentIndex];

    if (cardEl) {
      cardEl.style.opacity = '0.35';
      cardEl.style.transform = 'translateY(4px)';
    }

    setTimeout(function () {
      quoteEl.textContent = '“' + item.quote + '”';
      authorEl.textContent = item.author;
      roleEl.textContent = item.role;
      logoEl.src = item.logo;
      logoEl.alt = item.author;
      if (countEl) countEl.textContent = (currentIndex + 1) + ' / ' + testimonials.length;

      if (cardEl) {
        cardEl.style.opacity = '1';
        cardEl.style.transform = 'translateY(0)';
      }
    }, 150);
  }

  function nextTestimonial() {
    renderTestimonial(currentIndex + 1);
  }

  function prevTestimonial() {
    renderTestimonial(currentIndex - 1);
  }

  function shuffleTestimonials() {
    var nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * testimonials.length);
    } while (nextIdx === currentIndex && testimonials.length > 1);
    renderTestimonial(nextIdx);
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextTestimonial, 7000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  var prevBtn = document.getElementById('testimonial-prev');
  var nextBtn = document.getElementById('testimonial-next');
  var shuffleBtn = document.getElementById('shuffle-testimonials');

  if (prevBtn) prevBtn.addEventListener('click', function () { prevTestimonial(); startAutoSlide(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { nextTestimonial(); startAutoSlide(); });
  if (shuffleBtn) shuffleBtn.addEventListener('click', function () { shuffleTestimonials(); startAutoSlide(); });

  if (cardEl) {
    cardEl.addEventListener('mouseenter', stopAutoSlide);
    cardEl.addEventListener('mouseleave', startAutoSlide);
  }

  renderTestimonial(0);
  startAutoSlide();

  /* 7. Contact Consultation Form (Routes to admin@moadeassociates.com) -------- */
  var cForm = document.getElementById('consultation-form');
  var cStatus = document.getElementById('c-status');
  var cWhatsApp = document.getElementById('c-whatsapp-btn');

  if (cForm) {
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('c-name').value.trim();
      var email = document.getElementById('c-email').value.trim();
      var phone = document.getElementById('c-phone').value.trim();
      var practice = document.getElementById('c-practice').value;
      var subject = document.getElementById('c-subject').value.trim();
      var message = document.getElementById('c-message').value.trim();

      if (!name || !email || !subject || !message) {
        if (cStatus) cStatus.textContent = 'Please complete all required fields.';
        return;
      }

      var mailtoLink = 'mailto:admin@moadeassociates.com' +
        '?subject=' + encodeURIComponent('[Consultation Request] ' + subject) +
        '&body=' + encodeURIComponent(
          'Client Consultation Request — MOADE Associates\n\n' +
          'Name: ' + name + '\n' +
          'Email: ' + email + '\n' +
          'Phone: ' + (phone || 'Not provided') + '\n' +
          'Practice Area: ' + practice + '\n\n' +
          'Matter Details:\n' + message
        );

      window.location.href = mailtoLink;

      if (cStatus) {
        cStatus.innerHTML = '<span class="text-[#076A72] font-bold">✓ Opening your email client to send to admin@moadeassociates.com...</span> If your mail client does not open automatically, please send directly to admin@moadeassociates.com.';
      }
    });
  }

  if (cWhatsApp) {
    cWhatsApp.addEventListener('click', function () {
      var name = document.getElementById('c-name').value.trim() || 'Prospective Client';
      var practice = document.getElementById('c-practice').value;
      var message = document.getElementById('c-message').value.trim() || 'I would like to inquire about legal advisory services.';
      var text = 'Hello MOADE Associates, my name is ' + name + '. I am interested in ' + practice + ':\n\n' + message;
      window.open('https://wa.me/2348153380312?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* 8. Speak to a Lawyer Modal Form (Routes to admin@moadeassociates.com) ---- */
  var spkForm = document.getElementById('speak-modal-form');
  var spkStatus = document.getElementById('spk-status');
  var spkWhatsApp = document.getElementById('spk-whatsapp-btn');

  if (spkForm) {
    spkForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('spk-name').value.trim();
      var email = document.getElementById('spk-email').value.trim();
      var phone = document.getElementById('spk-phone').value.trim();
      var practice = document.getElementById('spk-practice').value;
      var subject = document.getElementById('spk-subject').value.trim();
      var body = document.getElementById('spk-body').value.trim();

      if (!name || !email || !subject || !body) {
        if (spkStatus) spkStatus.textContent = 'Please fill out your name, email, subject, and matter details.';
        return;
      }

      var mailtoLink = 'mailto:admin@moadeassociates.com' +
        '?subject=' + encodeURIComponent('[Speak to a Lawyer] ' + subject) +
        '&body=' + encodeURIComponent(
          'Speak to a Lawyer Request — MOADE Associates\n\n' +
          'From: ' + name + ' (' + email + ')\n' +
          'Phone: ' + (phone || 'Not provided') + '\n' +
          'Practice Area: ' + practice + '\n\n' +
          'Subject: ' + subject + '\n\n' +
          'Body / Matter Description:\n' + body
        );

      window.location.href = mailtoLink;

      if (spkStatus) {
        spkStatus.innerHTML = '<span class="text-[#076A72] font-bold">✓ Prepared dispatch to admin@moadeassociates.com.</span> A member of our legal team will reach out promptly.';
      }
    });
  }

  if (spkWhatsApp) {
    spkWhatsApp.addEventListener('click', function () {
      var name = document.getElementById('spk-name').value.trim() || 'Client';
      var subject = document.getElementById('spk-subject').value.trim() || 'Consultation Inquiry';
      var text = 'Hello MOADE Associates, this is ' + name + ' regarding: ' + subject + '. I would like to speak with a lawyer.';
      window.open('https://wa.me/2348153380312?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* 9. Application for Employment (Join Us) Form (Routes to eamoade@gmail.com) */
  var empForm = document.getElementById('employment-form');
  var empStatus = document.getElementById('emp-status');

  if (empForm) {
    empForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fname = document.getElementById('emp-fname').value.trim();
      var lname = document.getElementById('emp-lname').value.trim();
      var email = document.getElementById('emp-email').value.trim();
      var phone = document.getElementById('emp-phone').value.trim();
      var address = document.getElementById('emp-address').value.trim();
      var position = document.getElementById('emp-position').value;
      var notes = document.getElementById('emp-notes').value.trim();
      var resumeInput = document.getElementById('emp-resume');

      if (!fname || !lname || !email || !phone || !address || !position) {
        if (empStatus) empStatus.textContent = 'Please complete all required candidate details.';
        return;
      }

      var resumeName = (resumeInput && resumeInput.files && resumeInput.files[0])
        ? resumeInput.files[0].name
        : 'Resume attached';

      var mailtoLink = 'mailto:eamoade@gmail.com' +
        '?subject=' + encodeURIComponent('Application for Employment: ' + position + ' - ' + fname + ' ' + lname) +
        '&body=' + encodeURIComponent(
          'APPLICATION FOR EMPLOYMENT — MOADE Associates\n\n' +
          'CANDIDATE DETAILS:\n' +
          'First Name: ' + fname + '\n' +
          'Last Name: ' + lname + '\n' +
          'Email: ' + email + '\n' +
          'Phone Number: ' + phone + '\n' +
          'Current Address: ' + address + '\n' +
          'Position Applied For: ' + position + '\n\n' +
          'APPLICATION UPLOADS:\n' +
          'Resume / CV: ' + resumeName + ' (Please attach your file to this email if prompted)\n\n' +
          'Statement of Interest:\n' + (notes || 'None provided')
        );

      window.location.href = mailtoLink;

      if (empStatus) {
        empStatus.innerHTML = '<span class="text-[#076A72] font-bold">✓ Application ready! Opening email client addressed to eamoade@gmail.com.</span> Please attach your resume file if prompted and hit send.';
      }
    });
  }

  /* 10. Smart Mobile Bar Auto-Hide on Scroll -------------------------------- */
  var mBar = document.querySelector('.mobile-bar');
  if (mBar) {
    var lastY = window.scrollY;
    var threshold = 90;
    window.addEventListener('scroll', function () {
      var currY = window.scrollY;
      if (currY > lastY && currY > threshold) {
        // Scrolling down -> hide bar smoothly so text is completely visible
        mBar.classList.add('bar-hidden');
      } else {
        // Scrolling up -> reveal quick action bar
        mBar.classList.remove('bar-hidden');
      }
      lastY = currY;
    }, { passive: true });
  }

})();
