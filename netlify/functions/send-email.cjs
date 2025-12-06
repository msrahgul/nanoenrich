const nodemailer = require('nodemailer');

exports.handler = async function (event, context) {
    // 1. Allow only POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 2. Parse the body
    const { type, data } = JSON.parse(event.body);

    // 3. Get Credentials
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    // This ensures the email goes to the Company (you)
    const COMPANY_EMAIL = process.env.COMPANY_EMAIL || EMAIL_USER;

    if (!EMAIL_USER || !EMAIL_PASS) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server Email Config Missing' }) };
    }

    // 4. Configure Transporter (Fixed for Local Network Issues)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Helps with local antivirus SSL interception
        },
        family: 4 // <--- FORCES IPv4 (Fixes the ETIMEDOUT error)
    });

    // 5. Build Email Content
    let subject = "";
    let htmlContent = "";

    if (type === 'contact') {
        subject = `🔔 New Contact Inquiry: ${data.subject}`;
        htmlContent = `
      <h2>New Message from Website</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <br/>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
        ${data.message}
      </div>
    `;
    } else if (type === 'order') {
        const { orderId, customer, items, total } = data;

        // Create list of items
        const itemsHtml = items.map(item =>
            `<li style="margin-bottom: 5px;">
         <strong>${item.product.name}</strong> 
         <br/>Qty: ${item.quantity} | Price: ₹${item.product.price * item.quantity}
       </li>`
        ).join('');

        subject = `📦 New Order Received! #${orderId.slice(-6)}`;
        htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #2c3e50;">New Order Alert! 🎉</h1>
        <p style="font-size: 16px;"><strong>Order ID:</strong> #${orderId}</p>
        <p style="font-size: 18px; color: #27ae60;"><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">

        <h3>👤 Customer Details</h3>
        <p><strong>Name:</strong> ${customer.fullName}</p>
        <p><strong>Mobile:</strong> <a href="tel:${customer.mobile}">${customer.mobile}</a></p>
        <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
        <p><strong>Address:</strong><br/>
        ${customer.flat}, ${customer.area}<br/>
        ${customer.landmark ? `(Landmark: ${customer.landmark})<br/>` : ''}
        ${customer.city}, ${customer.state} - ${customer.pincode}</p>

        <hr style="border: 1px solid #eee; margin: 20px 0;">

        <h3>bs Items Ordered</h3>
        <ul>${itemsHtml}</ul>
      </div>
    `;
    }

    // 6. Send the Email
    try {
        await transporter.sendMail({
            from: `"NanoEnrich System" <${EMAIL_USER}>`,
            to: COMPANY_EMAIL, // Sends to YOUR company email
            replyTo: data.email || undefined,
            subject: subject,
            html: htmlContent,
        });

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        console.error("Email Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
