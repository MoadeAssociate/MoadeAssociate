/* MOADE Associates — interface behaviour */

(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var menu = document.getElementById('mobile-menu');
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');
  var main = document.querySelector('main');
  var footer = document.querySelector('.site-footer');
  var mobileBar = document.querySelector('.mobile-bar');
  var practiceSelect = document.getElementById('practice');

  /* Header state --------------------------------------------------------- */

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Mobile menu ---------------------------------------------------------- */

  function setBackgroundInert(value) {
    if (main) main.inert = value;
    if (footer) footer.inert = value;
    if (header) header.inert = value;
    if (mobileBar) mobileBar.inert = value;
  }

  function openMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    setBackgroundInert(true);
    var firstLink = menu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu(returnFocus) {
    if (!menu || !menuToggle) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setBackgroundInert(false);
    if (returnFocus) menuToggle.focus();
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', function () {
      closeMenu(true);
    });
  }

  if (menu) {
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu(false);
      });
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu && menu.classList.contains('open')) {
      closeMenu(true);
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1120 && menu && menu.classList.contains('open')) {
      closeMenu(false);
    }
  });

  /* Practice accordion --------------------------------------------------- */

  var practiceItems = Array.prototype.slice.call(document.querySelectorAll('.practice-item'));

  practiceItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      practiceItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* Practice prefills ---------------------------------------------------- */

  document.querySelectorAll('[data-practice]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (!practiceSelect) return;
      var value = link.getAttribute('data-practice');
      var matchingOption = Array.prototype.find.call(practiceSelect.options, function (option) {
        return option.value === value;
      });
      if (matchingOption) {
        practiceSelect.value = value;
        practiceSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  /* Number Counter Animation (for 30+ Years of Experience) ---------------- */

  var counterEl = document.querySelector('[data-counter]');
  if (counterEl && 'IntersectionObserver' in window) {
    var counted = false;
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        var target = parseInt(counterEl.getAttribute('data-counter'), 10) || 30;
        var start = 0;
        var duration = 1600;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var current = Math.floor(progress * target);
          counterEl.textContent = current;
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            counterEl.textContent = target;
          }
        }
        window.requestAnimationFrame(step);
      }
    }, { threshold: 0.2 });
    observer.observe(counterEl);
  }

  /* Consultation form ---------------------------------------------------- */

  var form = document.getElementById('consultation-form');
  var status = document.getElementById('form-status');
  var whatsappSend = document.getElementById('whatsapp-send');
  var fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    practice: document.getElementById('practice'),
    message: document.getElementById('message')
  };

  function fieldWrapper(input) {
    return input ? input.closest('.field') : null;
  }

  function errorElement(input) {
    return input ? document.getElementById(input.id + '-error') : null;
  }

  function clearError(input) {
    if (!input) return;
    var wrapper = fieldWrapper(input);
    var message = errorElement(input);
    if (wrapper) wrapper.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    if (message) {
      message.hidden = true;
      message.textContent = '';
    }
  }

  function setError(input, text) {
    if (!input) return;
    var wrapper = fieldWrapper(input);
    var message = errorElement(input);
    if (wrapper) wrapper.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    if (message) {
      message.textContent = text;
      message.hidden = false;
    }
  }

  function validate() {
    var firstInvalid = null;

    clearError(fields.name);
    clearError(fields.email);
    clearError(fields.message);

    if (!fields.name || !fields.name.value.trim()) {
      if (fields.name) {
        setError(fields.name, 'Please enter your name.');
        firstInvalid = firstInvalid || fields.name;
      }
    }

    var emailValue = fields.email ? fields.email.value.trim() : '';
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailPattern.test(emailValue)) {
      if (fields.email) {
        setError(fields.email, emailValue ? 'Please enter a valid email address.' : 'Please enter your email address.');
        firstInvalid = firstInvalid || fields.email;
      }
    }

    if (!fields.message || !fields.message.value.trim()) {
      if (fields.message) {
        setError(fields.message, 'Please tell us briefly what the matter is.');
        firstInvalid = firstInvalid || fields.message;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      if (status) status.textContent = 'Please check the highlighted fields.';
      return null;
    }

    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone ? fields.phone.value.trim() : '',
      practice: fields.practice ? fields.practice.value : 'Not sure yet',
      message: fields.message.value.trim()
    };
  }

  function buildPlainMessage(data) {
    return [
      'New consultation request — MOADE Associates',
      '',
      'Name: ' + data.name,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || 'Not provided'),
      'Practice area: ' + data.practice,
      '',
      'Situation:',
      data.message
    ].join('\n');
  }

  Object.keys(fields).forEach(function (key) {
    var input = fields[key];
    if (!input) return;
    var message = errorElement(input);
    if (message && message.id) {
      input.setAttribute('aria-describedby', message.id);
    }
    input.addEventListener('input', function () {
      clearError(input);
      if (status) status.textContent = '';
    });
  });

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var data = validate();
      if (!data) return;

      var subject = 'Consultation request — ' + data.practice;
      var mailto = 'mailto:admin@moadeassociates.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(buildPlainMessage(data));

      window.location.href = mailto;

      if (status) {
        status.textContent = 'Your email client is opening with your details prefilled. You can also message directly on WhatsApp below.';
      }
    });
  }

  if (whatsappSend) {
    whatsappSend.addEventListener('click', function () {
      var data = validate();
      if (!data) return;

      var url = 'https://wa.me/2348153380312?text=' + encodeURIComponent(buildPlainMessage(data));
      var opened = window.open(url, '_blank', 'noopener');

      if (!opened) {
        window.location.href = url;
      }

      if (status) {
        status.textContent = 'WhatsApp is opening with your consultation details ready to send.';
      }
    });
  }
})();
