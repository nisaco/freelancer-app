const axios = require('axios');

const normalizePhone = (phone = '') => {
  const cleaned = String(phone).replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned.slice(1);
  if (cleaned.startsWith('0')) return `233${cleaned.slice(1)}`;
  return cleaned;
};

const sendWhatsAppJobAlert = async ({ phone, serviceType, location, platform = 'LINKUP' }) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = normalizePhone(phone);

  if (!token || !phoneNumberId || !to) {
    return { sent: false, reason: 'missing_config_or_phone' };
  }

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body: `${platform}: You have a new job request for ${serviceType || 'a service'}${location ? ` in ${location}` : ''}. Log in to accept.`
    }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return { sent: true, data: response.data };
  } catch (error) {
    return {
      sent: false,
      reason: 'send_failed',
      error: error.response?.data || error.message
    };
  }
};

module.exports = { sendWhatsAppJobAlert };

