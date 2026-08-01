export const WHATSAPP_NUMBER = '919594799320';

export function generateWhatsAppMessage(items, subtotal, delivery, total, customerName, address) {
    const date = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    let msg = `*NEW ORDER - EAGLE SHOP*\n`;
    msg += `Date: ${date}\n`;
    msg += `--------------------------------\n\n`;
    
    msg += `*CUSTOMER DETAILS*\n`;
    msg += `Name: ${customerName}\n`;
    msg += `Address:\n${address}\n\n`;
    msg += `--------------------------------\n\n`;

    msg += `*ORDER DETAILS*\n`;
    items.forEach(item => {
        msg += `- ${item.name} (x${item.quantity}) = ₹${item.price * item.quantity}\n`;
    });

    msg += `\n--------------------------------\n\n`;
    
    msg += `*PAYMENT SUMMARY*\n`;
    msg += `Subtotal: ₹${subtotal}\n`;
    msg += `Delivery: ${delivery === 0 ? 'FREE' : '₹' + delivery}\n`;
    msg += `*GRAND TOTAL: ₹${total}*\n\n`;
    msg += `--------------------------------\n\n`;

    msg += `*INSTRUCTIONS*\n`;
    msg += `Please confirm this order and deliver in 30 mins.\n`;
    msg += `Payment Method: Cash/UPI on Delivery`;

    return msg;
}

export function generateWhatsAppUrl(items, subtotal, delivery, total, customerName, address) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(generateWhatsAppMessage(items, subtotal, delivery, total, customerName, address))}`;
}
