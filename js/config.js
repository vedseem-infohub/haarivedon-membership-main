/**
 * HaarivedOn - Static Website & Payment Configuration
 *
 * HOW TO CONFIGURE GOOGLE SHEETS:
 * 1. Open your Google Sheet.
 * 2. Click Extensions > Apps Script.
 * 3. Copy & paste the code from `google-sheets-script.js` into the script editor.
 * 4. Click Deploy > New deployment.
 * 5. Select type "Web app".
 * 6. Set "Execute as: Me" and "Who has access: Anyone".
 * 7. Click Deploy, copy the Web App URL, and paste it below in GOOGLE_SHEETS_URL.
 *
 * HOW TO CONFIGURE RAZORPAY:
 * - Enter your Razorpay Key ID (starts with rzp_live_ or rzp_test_) in RAZORPAY_KEY_ID below.
 */

const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

globalScope.CONFIG = {
  // Google Sheets Apps Script Web App URL
  // Paste your Web App URL here (e.g. 'https://script.google.com/macros/s/AKfycbx.../exec')
  GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/AKfycbwFkgaJ2lwc7hIfwisxXNGk_hCxCZDN_YuxSL_TpoMOEvv6nFosu3W-y6k06Neof6A/exec',

  // Razorpay Key ID (from Razorpay Dashboard > Settings > API Keys)
  RAZORPAY_KEY_ID: 'rzp_live_Tkdzmr3lmmsdWc',

  // Website Brand Info
  SITE_NAME: 'HaarivedOn',
  THEME_COLOR: '#0b3d2e',

  // Product Pricing & Details
  PRODUCTS: {
    membership: {
      id: 'membership',
      name: 'Haarivedon 365-Day Membership',
      tagline: 'Festive Offer – 70% OFF',
      amountPaise: 210000, // ₹2,100 in paise
      amountDisplay: 2100,
      description: 'Daily meditation webinars, all webinar courses free, monthly remedies',
    },
    course: {
      id: 'course',
      name: 'Draftsmanship Course',
      tagline: 'House/Property Layouting – 1 Month',
      amountPaise: 510000, // ₹5,100 in paise
      amountDisplay: 5100,
      description: 'House & property layout design with Neelam Ajay Singh',
    },
  },

  // Optional: Custom Razorpay Payment Links (e.g. 'https://rzp.io/l/...')
  // If filled, the user will be redirected to the Razorpay hosted payment link.
  // If left empty, the standard Razorpay Checkout popup will open directly on this page.
  PAYMENT_LINKS: {
    membership: '',
    course: '',
  },
};
