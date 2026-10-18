(function () {
  'use strict';

  var CONFIG = window.CONFIG || {
    GOOGLE_SHEETS_URL: '',
    RAZORPAY_KEY_ID: 'rzp_live_Tkdzmr3lmmsdWc',
    SITE_NAME: 'HaarivedOn',
    THEME_COLOR: '#0b3d2e',
    PRODUCTS: {
      membership: {
        name: 'Haarivedon 365-Day Membership',
        tagline: 'Festive Offer – 70% OFF',
        amountPaise: 210000,
        amountDisplay: 2100,
      },
      course: {
        name: 'Draftsmanship Course',
        tagline: 'House/Property Layouting – 1 Month',
        amountPaise: 510000,
        amountDisplay: 5100,
      },
    },
    PAYMENT_LINKS: {},
  };

  var MESSAGES = {
    membership: {
      paid: 'Welcome to the Haarivedon 365-Day Membership! Our team will contact you on your registered mobile number within 24 hours with your webinar links.',
    },
    course: {
      paid: 'Your enrollment in the Draftsmanship course is confirmed. Our team will contact you within 24 hours with your class schedule.',
      details: 'Thank you! Our team will call you shortly with complete Draftsmanship course details.',
    },
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var loader = $('#loader');
  var modal = $('#modal');

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Local storage backup helper
  function saveLocalLead(data) {
    try {
      var existing = JSON.parse(localStorage.getItem('haarivedon_leads') || '[]');
      existing.unshift(data);
      if (existing.length > 100) existing.length = 100;
      localStorage.setItem('haarivedon_leads', JSON.stringify(existing));
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  }

  // Google Sheets Direct Submission
  function submitToGoogleSheets(data) {
    saveLocalLead(data);

    if (!CONFIG.GOOGLE_SHEETS_URL || !CONFIG.GOOGLE_SHEETS_URL.startsWith('http')) {
      console.info('Google Sheets URL not configured in config.js. Lead safely saved to local backup.');
      return Promise.resolve({ success: true, offline: true });
    }

    return fetch(CONFIG.GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    }).catch(function (err) {
      console.error('Google Sheets transmission warning:', err);
      return { success: false, error: err };
    });
  }

  function showModal(title, text, ok) {
    $('#modal-title').textContent = title;
    $('#modal-text').textContent = text;
    var icon = $('#modal-icon');
    icon.textContent = ok ? '✓' : '!';
    icon.className = 'modal-icon' + (ok ? '' : ' error');
    modal.hidden = false;
    $('#modal-close').focus();
  }

  var modalClose = $('#modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function () { modal.hidden = true; });
  }
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
  }

  function setMsg(form, text, type) {
    var el = $('.form-msg', form);
    if (!el) return;
    el.textContent = text || '';
    el.className = 'form-msg' + (type ? ' ' + type : '');
  }

  function validate(form) {
    var errors = [];
    var fields = form.querySelectorAll('input, textarea');
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      f.value = f.value.trim ? f.value.replace(/^\s+/, '') : f.value;
      var bad = false;
      if (f.name === 'mobile') {
        f.value = f.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
        bad = !/^[6-9]\d{9}$/.test(f.value);
        if (bad) errors.push('Enter a valid 10-digit mobile number');
      } else if (f.name === 'dob') {
        bad = !/^\d{4}-\d{2}-\d{2}$/.test(f.value) || new Date(f.value) > new Date();
        if (bad) errors.push('Select your date of birth');
      } else if (f.name === 'name') {
        bad = f.value.trim().length < 2;
        if (bad) errors.push('Enter your full name');
      } else if (f.name === 'address') {
        bad = f.value.trim().length < 5;
        if (bad) errors.push('Enter your address');
      }
      f.classList.toggle('invalid', bad);
    }
    return errors;
  }

  function waitForRazorpay(timeoutMs) {
    return new Promise(function (resolve, reject) {
      var start = Date.now();
      (function check() {
        if (window.Razorpay) return resolve();
        if (Date.now() - start > timeoutMs) {
          return reject(new Error('Payment gateway failed to load. Please check your internet connection and try again.'));
        }
        setTimeout(check, 150);
      })();
    });
  }

  // Track which submit button was tapped
  var lastIntent = new WeakMap();
  document.querySelectorAll('.lead-form button[type=submit]').forEach(function (btn) {
    btn.addEventListener('click', function () { lastIntent.set(btn.form, btn.getAttribute('data-intent')); });
  });

  document.querySelectorAll('.lead-form').forEach(function (form) {
    var dob = form.querySelector('input[name=dob]');
    if (dob) dob.max = new Date().toISOString().slice(0, 10);

    form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('input', function () { f.classList.remove('invalid'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var intent = (e.submitter && e.submitter.getAttribute('data-intent')) || lastIntent.get(form) || 'pay';
      var errors = validate(form);
      if (errors.length) {
        setMsg(form, errors[0], 'error');
        var first = form.querySelector('.invalid');
        if (first) first.focus();
        return;
      }
      setMsg(form, '');

      var product = form.getAttribute('data-product') || 'membership';
      var productConfig = (CONFIG.PRODUCTS && CONFIG.PRODUCTS[product]) || {
        name: product,
        tagline: '',
        amountPaise: 210000,
        amountDisplay: 2100,
      };

      var leadData = {
        id: 'hv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        product: product,
        productTitle: productConfig.name,
        intent: intent,
        status: intent === 'details' ? 'Details Requested' : 'Lead - Checkout Opened',
        name: (form.querySelector('input[name=name]') || {}).value || '',
        address: (form.querySelector('textarea[name=address]') || {}).value || '',
        mobile: (form.querySelector('input[name=mobile]') || {}).value || '',
        dob: (form.querySelector('input[name=dob]') || {}).value || '',
        amount: intent === 'details' ? 0 : productConfig.amountDisplay,
        createdAt: new Date().toISOString(),
        source: location.href,
        userAgent: navigator.userAgent || '',
      };

      var buttons = form.querySelectorAll('button');
      buttons.forEach(function (b) { b.disabled = true; });

      // Flow 1: Course details inquiry (No payment needed)
      if (intent === 'details') {
        submitToGoogleSheets(leadData);
        form.reset();
        buttons.forEach(function (b) { b.disabled = false; });
        showModal('Request received', MESSAGES.course.details, true);
        return;
      }

      // Flow 2: Payment flow
      if (loader) loader.hidden = false;

      // Immediately log lead to Google Sheets so customer info is captured even if checkout is abandoned
      submitToGoogleSheets(leadData);

      // Check if custom hosted payment link is configured
      var customLink = CONFIG.PAYMENT_LINKS && CONFIG.PAYMENT_LINKS[product];
      if (customLink && customLink.startsWith('http')) {
        location.href = customLink;
        return;
      }

      // Open Razorpay Standard Checkout
      waitForRazorpay(10000)
        .then(function () {
          var options = {
            key: CONFIG.RAZORPAY_KEY_ID,
            amount: productConfig.amountPaise,
            currency: 'INR',
            name: CONFIG.SITE_NAME || 'HaarivedOn',
            description: productConfig.name + ' (' + productConfig.tagline + ')',
            image: new URL('assets/logo.png', location.href).href,
            prefill: {
              name: leadData.name,
              contact: '+91' + leadData.mobile,
            },
            notes: {
              lead_id: leadData.id,
              product: product,
              address: leadData.address,
              dob: leadData.dob || '',
            },
            theme: {
              color: CONFIG.THEME_COLOR || '#0b3d2e',
            },
            modal: {
              ondismiss: function () {
                leadData.status = 'Payment Dismissed';
                submitToGoogleSheets(leadData);
                setMsg(form, 'Payment was not completed. Tap the button again to retry.', 'error');
                buttons.forEach(function (b) { b.disabled = false; });
              },
              confirm_close: true,
              backdropclose: false,
            },
            handler: function (response) {
              if (loader) {
                loader.hidden = false;
                var p = loader.querySelector('p');
                if (p) p.textContent = 'Confirming your payment…';
              }
              leadData.status = 'PAID';
              leadData.paymentId = response.razorpay_payment_id;

              submitToGoogleSheets(leadData).then(function () {
                location.href = 'thank-you.html?product=' + product + '&status=success&payment_id=' + encodeURIComponent(response.razorpay_payment_id);
              });
            },
          };

          var rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (resp) {
            var reason = (resp && resp.error && resp.error.description) || 'Payment failed';
            leadData.status = 'Payment Failed: ' + reason;
            submitToGoogleSheets(leadData);
            setMsg(form, 'Payment failed: ' + reason + '. Please try again.', 'error');
            buttons.forEach(function (b) { b.disabled = false; });
          });

          if (loader) loader.hidden = true;
          rzp.open();
        })
        .catch(function (err) {
          if (loader) loader.hidden = true;
          setMsg(form, err.message, 'error');
          buttons.forEach(function (b) { b.disabled = false; });
        });
    });
  });

  // Sticky mobile CTA visibility
  var sticky = document.getElementById('sticky-cta');
  if ('IntersectionObserver' in window && sticky) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
      sticky.classList.toggle('hide', visible.size > 0);
    }, { threshold: 0.15 });
    document.querySelectorAll('.lead-form, .hero .cta-row').forEach(function (el) { io.observe(el); });
  }
})();
