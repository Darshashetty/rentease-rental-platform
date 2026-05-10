function header() {
  return `
    <div style="background:#f8fafc;padding:18px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
      <h1 style="margin:0;color:#0f172a;font-size:20px">RentEase</h1>
      <p style="margin:6px 0 0;color:#64748b;font-size:12px">Your trusted rental platform</p>
    </div>
    <div style="padding:18px;font-family:Arial,Helvetica,sans-serif;">
  `;
}

function footer() {
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#94a3b8;font-size:12px;margin-top:18px">&copy; ${new Date().getFullYear()} RentEase. All rights reserved.</div></div>`;
}

function orderConfirmation({ userName, productName, totalCost, orderId }) {
  return `${header()}
    <h2 style="color:#0f172a">Order Confirmed</h2>
    <p>Hi ${userName},</p>
    <p>Your order <strong>#${orderId}</strong> for <strong>${productName}</strong> has been received.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      <tr>
        <td style="padding:8px;border:1px solid #e6eef6">Total</td>
        <td style="padding:8px;border:1px solid #e6eef6">₹${totalCost}</td>
      </tr>
    </table>
    <p style="margin-top:12px;color:#475569">You can view order status in your RentEase dashboard.</p>
  ` + footer();
}

function orderApproved({ userName, productName, orderId }) {
  return `${header()}
    <h2 style="color:#0f172a">Order Approved</h2>
    <p>Hi ${userName},</p>
    <p>Your order <strong>#${orderId}</strong> for <strong>${productName}</strong> has been approved by an administrator.</p>
    <p style="margin-top:12px;color:#475569">We will update delivery and next steps on your dashboard.</p>
  ` + footer();
}

module.exports = {
  orderConfirmation,
  orderApproved,
};
