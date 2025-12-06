const nodemailer = require('nodemailer');

exports.handler = async function (event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { type, data } = JSON.parse(event.body);

    // 1. Get Secrets from Environment Variables (Set these in Netlify)
    const EMAIL_USER = process.env.EMAIL_USER; // Your Gmail address
    const EMAIL_PASS = process.env.EMAIL_PASS; // Your Gmail App Password
    const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_USER; // Where to send the alerts

    if (!EMAIL_USER || !EMAIL_PASS) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server Email Config Missing' }) };
    }

    // 2. Configure Transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,              // Use port 587 instead of 465
        secure: false,          // False for 587 (uses STARTTLS), True for 465
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3',     // Helps with some network handshake issues
            rejectUnauthorized: false // Helps avoid some local SSL errors (optional, try without first)
        }
    });

    // 3. Prepare Email Content
    let subject = "";
    let htmlContent = "";

    if (type === 'contact') {
        // --- CONTACT FORM EMAIL ---
        subject = `New Contact Inquiry: ${data.subject}`;
        htmlContent = `
      <h2>New Message from Website</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <br/>
      <p><strong>Message:</strong></p>
      <p style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${data.message}</p>
    `;
    } else if (type === 'order') {
        // --- ORDER PLACED EMAIL ---
        const { orderId, customer, items, total } = data;

        // Generate Items List
        const itemsHtml = items.map(item =>
            `<li>${item.product.name} (x${item.quantity}) - ₹${item.product.price * item.quantity}</li>`
        ).join('');

        subject = `New Order Received! #${orderId.slice(-6)}`;
        htmlContent = `
      <h1>New Order Alert! 🎉</h1>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
      
      <h3>Customer Details:</h3>
      <p><strong>Name:</strong> ${customer.fullName}</p>
      <p><strong>Phone:</strong> ${customer.mobile}</p>
      <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
      <p><strong>Address:</strong><br/>
      ${customer.flat}, ${customer.area}<br/>
      ${customer.city}, ${customer.state} - ${customer.pincode}</p>

      <h3>Order Items:</h3>
      <ul>${itemsHtml}</ul>
    `;
    } else {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email type' }) };
    }

    // 4. Send Email
    try {
        await transporter.sendMail({
            from: `"NanoEnrich Website" <${EMAIL_USER}>`,
            to: COMPANY_EMAIL, // Send to yourself
            replyTo: data.email || undefined, // Reply directly to customer
            subject: subject,
            html: htmlContent,
        });

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        console.error("Email Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};