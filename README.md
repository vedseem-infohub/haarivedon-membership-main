# HaarivedOn – 365-Day Membership & Draftsmanship Course Landing Page

A fast, static landing page with **direct Razorpay Payment Gateway integration** and **instant Google Sheets sync**.

Backend server and admin panel have been removed. All lead captures, inquiries, and successful payments are logged directly into your private Google Sheet in real time.

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Install dependencies (Vite dev server)
npm install

# 2. Start local development server
npm run dev
# or
npm start
```
The site will open at `http://localhost:3000`.

To build static production files:
```bash
npm run build
```
The production bundle will be generated in the `dist/` folder.

---

## 📊 Google Sheets Integration Setup (5 Minutes)

Your Google Sheet acts as your live database and dashboard. It automatically tracks every lead, date/time in IST, customer details, payment status, and even provides a **1-click WhatsApp chat link**!

### Step-by-Step Instructions:
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet (e.g. name it *"HaarivedOn Leads"*).
2. In the top menu bar, click **Extensions** > **Apps Script**.
3. Clear any existing code in the script editor.
4. Open the file [`google-sheets-script.js`](./google-sheets-script.js) from this project, copy all its content, and paste it into the Google Apps Script editor.
5. Click the **Save** icon (floppy disk) or press `Ctrl + S`.
6. Click the blue **Deploy** button (top-right) > **New deployment**.
7. Click the gear icon next to *Select type* and select **Web app**.
8. Fill in the deployment details:
   - **Description**: `HaarivedOn Leads Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(⚠️ Important: must be set to "Anyone" so the website can send data without login).*
9. Click **Deploy**, then click **Authorize access**, choose your Google account, and grant permissions.
10. Copy the generated **Web app URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`).
11. Open [`js/config.js`](./js/config.js) in this project and paste your URL into `GOOGLE_SHEETS_URL`:
   ```javascript
   GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
   ```

Done! As soon as a user clicks "Join Now" or "Get Course Details", the row is instantly appended with formatted columns in your Google Sheet.

---

## 💳 Payment Gateway Setup (Razorpay)

All payment settings live in [`js/config.js`](./js/config.js):

```javascript
window.CONFIG = {
  // 1. Google Sheets Web App URL
  GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/.../exec',

  // 2. Razorpay Key ID (Settings > API Keys in Razorpay Dashboard)
  RAZORPAY_KEY_ID: 'rzp_live_Tkdzmr3lmmsdWc',

  // 3. Product Pricing
  PRODUCTS: {
    membership: {
      name: 'Haarivedon 365-Day Membership',
      tagline: 'Festive Offer – 70% OFF',
      amountPaise: 210000, // ₹2,100
      amountDisplay: 2100,
    },
    course: {
      name: 'Draftsmanship Course',
      tagline: 'House/Property Layouting – 1 Month',
      amountPaise: 510000, // ₹5,100
      amountDisplay: 5100,
    },
  },

  // 4. (Optional) Custom Hosted Payment Links
  // If you prefer using Razorpay Payment Links (e.g. https://rzp.io/l/...), paste them here.
  // Leave blank to use the standard on-page Razorpay Checkout popup.
  PAYMENT_LINKS: {
    membership: '',
    course: '',
  },
};
```

---

## 🚀 How Leads & Payments Work

1. **Membership Purchase (₹2,100)**:
   - Customer fills full name, address, 10-digit mobile, and date of birth.
   - When they tap **"Join Now – Pay ₹2,100"**, the lead is immediately logged to Google Sheets as `Lead - Checkout Opened`.
   - Razorpay Checkout popup opens for UPI, Cards, Net Banking, or Wallets.
   - Upon successful payment:
     - Google Sheet is updated to `PAID` with the Razorpay `paymentId`.
     - Customer is redirected to `thank-you.html` displaying their confirmation and Payment ID.
   - If customer closes the popup without paying:
     - Google Sheet status is updated to `Payment Dismissed`, allowing your sales team to follow up via the WhatsApp button!

2. **Draftsmanship Course (₹5,100)**:
   - **"Enroll Now – Pay ₹5,100"**: Opens Razorpay for immediate payment and records enrollment.
   - **"Get Course Details"**: Captures name, address, and mobile number into Google Sheets with status `Details Requested` (no payment prompted). Shows instant confirmation modal.

3. **Offline & Network Fallback**:
   - Every lead is also safely backed up into `localStorage` in the browser, ensuring zero data loss even during internet hiccups.

---

## 🌐 Deployment (Host Anywhere)

Because this website has **no backend server**, you can host it for free on any static host:
- **Vercel**: Run `vercel` or link GitHub repository.
- **Netlify**: Drag and drop the project folder, or link GitHub.
- **GitHub Pages**: Push to repository and enable GitHub Pages on `main`.
- **Cloudflare Pages / Hostinger / cPanel**: Upload all static files (`index.html`, `styles.css`, `app.js`, `config.js`, `thank-you.html`, `assets/`).
