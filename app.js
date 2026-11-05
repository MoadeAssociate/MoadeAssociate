/* MOADE Associates — Interface & Interactive Behaviors */

(function () {
  'use strict';

  /* 0. SEO Host Synchronizer (Supports GitHub Pages & Custom Domain) -------- */
  try {
    var host = window.location.hostname;
    if (host === 'moadeassociates.com' || host === 'www.moadeassociates.com') {
      var can = document.getElementById('canonical-link');
      if (can) can.setAttribute('href', 'https://moadeassociates.com/');
      var ogUrl = document.getElementById('og-url');
      if (ogUrl) ogUrl.setAttribute('content', 'https://moadeassociates.com/');
      var ogImg = document.getElementById('og-image');
      if (ogImg) ogImg.setAttribute('content', 'https://moadeassociates.com/assets/images/og-image.jpg');
      var ogSec = document.getElementById('og-image-secure');
      if (ogSec) ogSec.setAttribute('content', 'https://moadeassociates.com/assets/images/og-image.jpg');
      var twImg = document.getElementById('tw-image');
      if (twImg) twImg.setAttribute('content', 'https://moadeassociates.com/assets/images/og-image.jpg');
    }
  } catch (e) {}

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
  var menuToggles = [
    document.getElementById('menu-toggle'),
    document.getElementById('hero-menu-toggle')
  ].filter(Boolean);
  var menuClose = document.getElementById('menu-close');

  function openMenu() {
    if (!menu) return;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggles.forEach(function (btn) { btn.setAttribute('aria-expanded', 'true'); });
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggles.forEach(function (btn) { btn.setAttribute('aria-expanded', 'false'); });
    document.body.classList.remove('menu-open');
  }

  menuToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      if (menu && menu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  });

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
      openModal(btn.getAttribute('data-open-modal'));
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
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openModal('search-modal');
    }
  });

  /* Search Filter Behavior */
  var searchInput = document.getElementById('site-search-input');
  var searchResultsList = document.getElementById('search-results-list');
  if (searchInput && searchResultsList) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      var entries = searchResultsList.querySelectorAll('.search-entry');
      entries.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = text.indexOf(query) !== -1 ? '' : 'none';
      });
    });
  }

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
      servicesTrack.scrollBy({ left: -384, behavior: 'smooth' });
    });
    servicesNext.addEventListener('click', function () {
      servicesTrack.scrollBy({ left: 384, behavior: 'smooth' });
    });
  }

  /* 6. Testimonial Slider & Shuffler ---------------------------------------- */
  var testimonials = [
    {
      author: 'Gaise Baba',
      role: 'Recording & Performing Artist, Cultural Leader',
      logo: 'assets/images/gaise-baba-logo.png',
      quote: 'Working with MOADE Associates has been one of the most defining decisions for my organization. Their support goes far beyond legal services, they bring clarity, structure, and strategic insight into every conversation. They understand the heart of my work, the purpose behind it, and the vision ahead. Whether it’s navigating complex agreements, shaping long-term strategy, or managing partnerships, MOADE Associates consistently delivers excellence with sincerity, depth, and precision. What I appreciate most is their ability to simplify complexity without reducing meaning, to protect my interests without stifling creativity, and to advise with both legal mastery and spiritual intelligence. MOADE Associates has become more than a legal partner; they are a trusted counsel and an essential part of how we build, grow, and move with integrity.'
    },
    {
      author: 'Mr Wang',
      role: 'Private Client — Multiple Business Ventures',
      mono: 'MW',
      quote: 'I have worked with Moade Associates for about 2 years now; their service is professional, and they are always willing to provide additional advisory outside their scope of work. The quality of their actual work is exceptional as well with a listening ear to their clients to provide flexible agreements that can help further their business. I consider myself safe and protected with Moade by my side.'
    },
    {
      author: 'Igwe Nancy',
      role: 'Label Manager — BME Records',
      logo: 'assets/images/logo-bme-hd.png',
      quote: 'At BME Records, we all want to express our sincere gratitude to Moade Associates for the exceptional work they have been doing. Working with Moade Associates has been nothing short of exceptional. Their professionalism, attention to detail, and deep understanding of the entertainment and business landscape have been invaluable to BME Records. From contract drafting to strategic legal advisory, their team has consistently demonstrated a high level of expertise and dedication. We consider them a trusted partner in our growth and operations. As someone who oversees multiple creative and business projects, I have found your guidance both reassuring and insightful. Your ability to simplify complex legal matters while prioritizing your clients’ best interests truly sets you apart. I am deeply grateful for your consistent professionalism and the peace of mind that your legal company provides.'
    },
    {
      author: 'Artcation Leadership',
      role: 'Creative Enterprise & Brand Development',
      logo: 'assets/images/logo-artcation.png',
      quote: 'Working with MOADE Associates has been one of the most seamless parts of building Artcation. From trademark registration to drafting partnership agreements, their attention to detail and understanding of creative businesses gave us the confidence to grow our brand the right way. They didn’t just handle the legalities, they understood our vision and helped protect it. Every document, every clause reflected the same care we put into our art. Having them on our side has been instrumental in shaping Artcation into the credible, future-ready brand it’s becoming.'
    },
    {
      author: 'Oreoluwa Oluwatobi',
      role: 'Yellow Oak · Iconic Stuff · Middle Men Publishing',
      mono: 'OO',
      quote: 'I think working with your team has blown away my expectations, you guys have made us very comfortable with details & ensured ease of understanding complex issues.'
    },
    {
      author: 'Elara Development Company Limited',
      role: 'Real Estate & Infrastructure Development',
      logo: 'assets/images/logo-elara.png',
      quote: 'Our company has worked with Moade Associates for several years, and their expertise in real estate law has been invaluable. They are highly competent, professional, and consistently deliver effective legal support. Their deep understanding of the real estate sector and proactive approach make them an essential partner in our projects.'
    },
    {
      author: 'Mr Tunde “TNT” Moriolari',
      role: 'Entrepreneur — Multi-Business Portfolio',
      mono: 'TM',
      quote: 'Working with MOADE Associates has been a great experience. From business registration and contract reviews to transaction negotiations and general legal support across our businesses, you and the team have been reliable, professional, and thorough. I appreciate having a team that understands our needs and provides the right guidance whenever we need it.'
    },
    {
      author: 'Cloudtoch Integrations',
      role: 'Smart Infrastructure & Technology',
      logo: 'assets/images/logo-cloudtoch.jpg',
      quote: 'Working with MOADE Associates has been a wonderful experience. As we are expanding, we need a reliable legal team. With Moade’s level of professionalism and how you handle our business, we have no doubts that we will be working with you for years to come. Thank you.'
    },
    {
      author: 'Cobalt Media Group',
      role: 'Entertainment & Media Production',
      logo: 'assets/images/logo-cobolt.jpg',
      quote: 'Moade & Associates provided top-notch legal and advisory services for our project. Their expertise and dedication gave us absolute peace of mind throughout our legal and commercial affairs.'
    },
    {
      author: 'Squared Lab',
      role: 'Venture Studio & Digital Acceleration',
      logo: 'assets/images/logo-squaredlab.jpg',
      quote: 'Their strategic support in corporate governance, contracts, and venture structuring made our business expansion seamless and legally robust.'
    },
    {
      author: 'Numio Technology',
      role: 'Fintech & Product Innovation',
      logo: 'assets/images/logo-numio.jpg',
      quote: 'Exceptional clarity, responsiveness, and genuine commercial insight in tech compliance and cross-border commercial strategy.'
    },
    {
      author: 'Ahava Living',
      role: 'Hospitality & Lifestyle Brand',
      logo: 'assets/images/logo-ahava.jpg',
      quote: 'A trustworthy partner who brings diligence and proactive foresight to every agreement. Highly dependable and strategic counsel.'
    }
  ];

  var currentIndex = 0;
  var quoteEl = document.getElementById('t-quote');
  var authorEl = document.getElementById('t-author');
  var roleEl = document.getElementById('t-role');
  var logoEl = document.getElementById('t-logo');
  var monoEl = document.getElementById('t-mono');
  var countEl = document.getElementById('t-count');
  var cardEl = document.getElementById('testimonial-card');
  var autoSlideTimer = null;

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function renderTestimonial(idx) {
    if (!quoteEl || !authorEl || !roleEl) return;
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

      if (monoEl && logoEl) {
        if (item.logo) {
          logoEl.src = item.logo;
          logoEl.alt = item.author;
          logoEl.style.display = '';
          monoEl.style.display = 'none';
        } else {
          monoEl.textContent = item.mono || '';
          monoEl.style.display = '';
          logoEl.style.display = 'none';
        }
      }

      if (countEl) countEl.textContent = pad(currentIndex + 1) + ' / ' + pad(testimonials.length);

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
    autoSlideTimer = setInterval(shuffleTestimonials, 7000);
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

  // Pause auto-slide for visitors who prefer reduced motion.
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    renderTestimonial(0);
    startAutoSlide();
  } else {
    renderTestimonial(0);
  }

  /* 7. Form dispatch helper ------------------------------------------------ */
  var MAX_CV_BYTES = 3 * 1024 * 1024; // keep under the Vercel request-body limit

  function field(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function readAttachment(inputEl) {
    return new Promise(function (resolve) {
      if (!inputEl || !inputEl.files || !inputEl.files[0]) {
        resolve(null);
        return;
      }
      var file = inputEl.files[0];
      if (file.size > MAX_CV_BYTES) {
        resolve({ error: 'CV is ' + Math.round(file.size / 1048576 * 10) / 10 + ' MB. Please attach a file under 3 MB.' });
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var base64 = String(reader.result).replace(/^data:[^;]+;base64,/, '');
        resolve({ filename: file.name, contentBase64: base64 });
      };
      reader.onerror = function () {
        resolve({ error: 'We could not read that file. Please try a different copy of your CV.' });
      };
      reader.readAsDataURL(file);
    });
  }

  function setStatus(el, html, isError) {
    if (!el) return;
    el.innerHTML = html;
    el.classList.toggle('is-error', !!isError);
  }

  function setSubmitting(form, button, busy, busyLabel) {
    if (!button) return;
    var label = button.querySelector('span') || button;
    if (busy) {
      button.dataset.originalLabel = label.textContent;
      button.disabled = true;
      button.classList.add('opacity-60', 'pointer-events-none');
      label.textContent = busyLabel || 'Sending…';
    } else {
      button.disabled = false;
      button.classList.remove('opacity-60', 'pointer-events-none');
      if (button.dataset.originalLabel) label.textContent = button.dataset.originalLabel;
    }
  }

  function mailtoFallback(statusEl, recipient, subject, bodyText) {
    var link = 'mailto:' + recipient +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(bodyText);
    setStatus(statusEl,
      'Dispatch could not complete — email service may still be connecting. ' +
      '<a class="underline font-bold" href="' + link + '">Tap here to open your email app instead</a>.', true);
  }

  function buildBody(formEl, keys) {
    var out = { honeypot: '' };
    keys.forEach(function (k) {
      var el = formEl.querySelector('[name="' + k + '"]');
      out[k] = el ? el.value.trim() : '';
    });
    out.honeypot = (formEl.querySelector('[name="company_website"]') || {}).value || '';
    return out;
  }

  /* 8. Contact Consultation Form ------------------------------------------- */
  var cForm = document.getElementById('consultation-form');
  var cStatus = document.getElementById('c-status');
  var cWhatsApp = document.getElementById('c-whatsapp-btn');

  if (cForm) {
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = cForm.querySelector('button[type="submit"]');

      var data = buildBody(cForm, ['name', 'email', 'phone', 'practice', 'subject', 'message']);
      data.type = 'consult';

      if (!data.name || !data.email || !data.subject || !data.message) {
        setStatus(cStatus, 'Please complete all required fields.', true);
        return;
      }

      setSubmitting(cForm, submitBtn, true, 'Sending…');
      setStatus(cStatus, '');

      fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok) {
            cForm.reset();
            setStatus(cStatus,
              '<span class="text-[#076A72] font-bold">✓ Sent.</span> Your message is now with our team at <strong>admin@moadeassociates.com</strong> — we respond within 24 business hours.');
          } else {
            mailtoFallback(cStatus, 'admin@moadeassociates.com',
              '[Consultation Request] ' + data.subject,
              'Name: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + data.phone + '\n\n' + data.message);
          }
        })
        .catch(function () {
          mailtoFallback(cStatus, 'admin@moadeassociates.com',
            '[Consultation Request] ' + data.subject,
            'Name: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + data.phone + '\n\n' + data.message);
        })
        .finally(function () { setSubmitting(cForm, submitBtn, false); });
    });
  }

  if (cWhatsApp) {
    cWhatsApp.addEventListener('click', function () {
      var name = field('c-name') || 'Prospective Client';
      var practice = field('c-practice') || 'legal advisory services';
      var message = field('c-message') || 'I would like to inquire about legal advisory services.';
      var text = 'Hello MOADE Associates, my name is ' + name + '. I am interested in ' + practice + ':\n\n' + message;
      window.open('https://wa.me/2348153380312?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* 9. Speak to a Lawyer Modal Form ----------------------------------------- */
  var spkForm = document.getElementById('speak-modal-form');
  var spkStatus = document.getElementById('spk-status');
  var spkWhatsApp = document.getElementById('spk-whatsapp-btn');

  if (spkForm) {
    spkForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = spkForm.querySelector('button[type="submit"]');

      var data = buildBody(spkForm, ['name', 'email', 'phone', 'practice', 'subject', 'body']);
      data.type = 'speak';

      if (!data.name || !data.email || !data.subject || !data.body) {
        setStatus(spkStatus, 'Please fill out your name, email, subject, and matter details.', true);
        return;
      }

      setSubmitting(spkForm, submitBtn, true, 'Sending…');
      setStatus(spkStatus, '');

      fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok) {
            spkForm.reset();
            setStatus(spkStatus,
              '<span class="text-[#076A72] font-bold">✓ Sent.</span> Your request is with our managing counsel at <strong>admin@moadeassociates.com</strong> — a member of the team will reach out promptly.');
          } else {
            mailtoFallback(spkStatus, 'admin@moadeassociates.com',
              '[Speak to a Lawyer] ' + data.subject,
              'From: ' + data.name + ' (' + data.email + ')\nPhone: ' + data.phone + '\n\nSubject: ' + data.subject + '\n\n' + data.body);
          }
        })
        .catch(function () {
          mailtoFallback(spkStatus, 'admin@moadeassociates.com',
            '[Speak to a Lawyer] ' + data.subject,
            'From: ' + data.name + ' (' + data.email + ')\nPhone: ' + data.phone + '\n\nSubject: ' + data.subject + '\n\n' + data.body);
        })
        .finally(function () { setSubmitting(spkForm, submitBtn, false); });
    });
  }

  if (spkWhatsApp) {
    spkWhatsApp.addEventListener('click', function () {
      var name = field('spk-name') || 'Client';
      var subject = field('spk-subject') || 'Consultation Inquiry';
      var text = 'Hello MOADE Associates, this is ' + name + ' regarding: ' + subject + '. I would like to speak with a lawyer.';
      window.open('https://wa.me/2348153380312?text=' + encodeURIComponent(text), '_blank');
    });
  }

  /* 10. Application for Employment (Join Us) Form ---------------------------- */
  var empForm = document.getElementById('employment-form');
  var empStatus = document.getElementById('emp-status');

  if (empForm) {
    empForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = empForm.querySelector('button[type="submit"]');
      var resumeInput = document.getElementById('emp-resume');

      var data = buildBody(empForm, ['firstName', 'lastName', 'email', 'phone', 'address', 'position', 'notes']);
      data.type = 'employment';

      if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.address || !data.position) {
        setStatus(empStatus, 'Please complete all required candidate details.', true);
        return;
      }

      setSubmitting(empForm, submitBtn, true, 'Uploading & sending…');
      setStatus(empStatus, '');

      readAttachment(resumeInput).then(function (attachment) {
        if (attachment && attachment.error) {
          setStatus(empStatus, attachment.error, true);
          setSubmitting(empForm, submitBtn, false);
          return;
        }
        data.attachment = attachment;

        return fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
          .then(function (res) {
            if (res.ok) {
              empForm.reset();
              setStatus(empStatus,
                '<span class="text-[#076A72] font-bold">✓ Application submitted.</span> Thank you — your details' +
                (attachment ? ' and CV ' + attachment.filename : '') +
                ' are now with our recruitment team at <strong>eamoade@gmail.com</strong>.');
            } else if (res.body && res.body.message && res.body.message.indexOf('3 MB') !== -1) {
              setStatus(empStatus, res.body.message, true);
            } else {
              mailtoFallback(empStatus, 'eamoade@gmail.com',
                'Application for Employment — ' + data.firstName + ' ' + data.lastName,
                'Position: ' + data.position + '\nEmail: ' + data.email + '\nPhone: ' + data.phone + '\nPlease find my CV attached to this email.');
            }
          });
      })
        .catch(function () {
          mailtoFallback(empStatus, 'eamoade@gmail.com',
            'Application for Employment — ' + data.firstName + ' ' + data.lastName,
            'Position: ' + data.position + '\nEmail: ' + data.email + '\nPhone: ' + data.phone + '\nPlease find my CV attached to this email.');
        })
        .finally(function () { setSubmitting(empForm, submitBtn, false); });
    });
  }

  /* 11. Smart Mobile Bar Auto-Hide on Scroll -------------------------------- */
  var mBar = document.querySelector('.mobile-bar');
  if (mBar) {
    var lastY = window.scrollY;
    var threshold = 90;
    window.addEventListener('scroll', function () {
      var currY = window.scrollY;
      if (currY > lastY && currY > threshold) {
        mBar.classList.add('bar-hidden');
      } else {
        mBar.classList.remove('bar-hidden');
      }
      lastY = currY;
    }, { passive: true });
  }

})();
