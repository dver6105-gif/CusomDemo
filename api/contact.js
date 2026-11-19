export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Methode nicht erlaubt.' });
  }

  if (!req.headers['content-type']?.toLowerCase().includes('application/json')) {
    return res.status(415).json({ success: false, error: 'Bitte JSON übermitteln.' });
  }

  const { name, email, message, privacyAccepted } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  if (cleanName.length < 1 || cleanName.length > 120) {
    return res.status(400).json({ success: false, error: 'Bitte geben Sie einen gültigen Namen ein.' });
  }
  if (!validEmail || cleanEmail.length > 254) {
    return res.status(400).json({ success: false, error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' });
  }
  if (cleanMessage.length < 1 || cleanMessage.length > 5000) {
    return res.status(400).json({ success: false, error: 'Bitte geben Sie eine Nachricht ein (maximal 5000 Zeichen).' });
  }
  if (privacyAccepted !== true) {
    return res.status(400).json({ success: false, error: 'Bitte bestätigen Sie die Datenschutzhinweise.' });
  }

  return res.status(200).json({
    success: true,
    message: 'Vielen Dank! Ihre Nachricht wurde erfolgreich übermittelt.'
  });
}
