/**
 * HaarivedOn Google Sheets Lead & Payment Webhook Script
 * =======================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet (https://sheets.google.com).
 * 2. In the top menu, go to: Extensions > Apps Script.
 * 3. Delete any default code in Code.gs and replace it with this entire file.
 * 4. Click the "Save project" icon (floppy disk).
 * 5. Click the blue "Deploy" button (top-right) > "New deployment".
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Set the following fields:
 *    - Description: "HaarivedOn Leads Webhook"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"  <-- CRITICAL: Must be "Anyone" so the website can submit leads!
 * 8. Click "Deploy".
 * 9. Click "Authorize access" and follow the prompts to allow the script to write to your Sheet.
 * 10. Copy the "Web app URL" (looks like https://script.google.com/macros/s/AKfycb.../exec).
 * 11. Open `config.js` in your website code and paste the URL into `GOOGLE_SHEETS_URL`.
 * 
 * That's it! Every lead and payment will automatically appear in your Google Sheet!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent requests to prevent row overwrites
  try {
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Server busy, please retry" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Parse the payload received from the website
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Auto-create and format styled header row if sheet is brand new/empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Date & Time (IST)",
        "Product",
        "Intent",
        "Status",
        "Customer Name",
        "Mobile Number",
        "WhatsApp Link",
        "Date of Birth",
        "Address",
        "Amount (₹)",
        "Payment ID",
        "Source URL"
      ];
      sheet.appendRow(headers);

      // Apply brand header styling
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0b3d2e");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 36);
      sheet.setFrozenRows(1);
    }

    // Prepare row values
    var timestamp = data.createdAt
      ? Utilities.formatDate(new Date(data.createdAt), "Asia/Kolkata", "dd MMM yyyy, hh:mm:ss a")
      : Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm:ss a");

    var mobile = String(data.mobile || "").replace(/\D/g, "");
    // Clickable WhatsApp link formula for 1-tap messaging from Google Sheets
    var waLink = mobile.length === 10
      ? '=HYPERLINK("https://wa.me/91' + mobile + '", "Chat on WhatsApp")'
      : "";

    var row = [
      timestamp,
      data.productTitle || (data.product === 'course' ? 'Draftsmanship Course' : 'Haarivedon 365-Day Membership'),
      data.intent === 'details' ? 'Course Details Request' : 'Payment',
      data.status || 'Received',
      data.name || '',
      mobile ? "'" + mobile : '', // Prefix with apostrophe to retain exact phone digits in Sheet
      waLink,
      data.dob || '-',
      data.address || '',
      data.amount ? Number(data.amount) : (data.product === 'course' ? 5100 : 2100),
      data.paymentId || '-',
      data.source || ''
    ];

    sheet.appendRow(row);

    // Format new row
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, row.length).setVerticalAlignment("middle");

    return ContentService.createTextOutput(JSON.stringify({ status: "success", row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("HaarivedOn Google Sheets Webhook is active and running!")
    .setMimeType(ContentService.MimeType.TEXT);
}
