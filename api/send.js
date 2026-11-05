/* MOADE Associates — form dispatch (Vercel Node serverless function)
 *
 * Routes browser form submissions to email via the Resend API.
 * Configure on Vercel: Project Settings → Environment Variables → RESEND_API_KEY.
 * For deliverability, verify moadeassociates.com in the Resend dashboard and set
 * RESEND_FROM (e.g. "MOADE Associates <admin@moadeassociates.com>"); the fallback
 * sender onboarding@resend.dev only reliably reaches the Resend account owner.
 *
 * Expected JSON body:
 *   { type: "consult" | "speak" | "employment", honeypot: "", ...fields,
 *     attachment: { filename, contentBase64 } }
 */

const RECIPIENTS = {
  consult: 'admin@moadeassociates.com',
  speak: 'admin@moadeassociates.com',
  employment: 'eamoade@gmail.com',
};

const SUBJECT_PREFIX = {
  consult: '[Consultation Request]',
  speak: '[Speak to a Lawyer]',
  employment: '[Application for Employment]',
};

const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // Vercel request body limit ~4.5MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      message:
        'Email service is not configured yet (missing RESEND_API_KEY). Please email us directly instead.',
    });
  }

  let body;
  try {
    body = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(req.body || '{}');
  } catch {
    return res.status(400).json({ message: 'Malformed submission.' });
  }

  const type = String(body.type || '');
  const to = RECIPIENTS[type];
  if (!to) {
    return res.status(400).json({ message: 'Unknown form type.' });
  }

  // Honeypot: bots that fill this field get a fake success and nothing is sent.
  if (body.honeypot) {
    return res.status(200).json({ message: 'Thank you.' });
  }

  let fields = [];
  try {
    fields = formatFields(type, body);
  } catch (err) {
    return res.status(400).json({ message: String(err.message || 'Invalid submission fields.') });
  }

  if (!body.email && type !== 'employment') {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  let subject = SUBJECT_PREFIX[type];
  if (type === 'employment') {
    subject += ' — ' + String(body.position || '') + ' — ' + String(body.firstName || '') + ' ' + String(body.lastName || '');
  } else if (body.subject) {
    subject += ' ' + String(body.subject);
  }
  subject = subject.trim();

  const payload = {
    from: process.env.RESEND_FROM || 'MOADE Website <onboarding@resend.dev>',
    reply_to: body.email || undefined,
    to: [to],
    subject: subject.slice(0, 240),
    text: fields.join('\n'),
  };

  if (type === 'employment' && body.attachment && body.attachment.contentBase64) {
    const approxBytes = Math.floor((body.attachment.contentBase64.length * 3) / 4);
    if (approxBytes > MAX_ATTACHMENT_BYTES) {
      return res
        .status(413)
        .json({ message: 'CV is too large. Please keep it under 3 MB.' });
    }
    payload.attachments = [
      {
        filename: sanitizeFilename(body.attachment.filename || 'award'),
        content: body.attachment.contentBase64,
      },
    ];
  }

  let ok = false;
  try {
    const apiRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    ok = apiRes.ok;
    if (!ok) {
      console.error('Resend error', apiRes.status, await apiRes.text().catch(() => ''));
    }
  } catch (err) {
    console.error('Resend network error', err);
  }

  if (!ok) {
    return res.status(502).json({
      message:
        'We could not send your message right now. Please try again, or email us directly at ' +
        to +
        '.',
    });
  }

  return res.status(200).json({ message: 'Sent', sentTo: to });
}

function sanitizeFilename(name) {
  return String(name).replace(/[^\w\-. ]+/g, '_').slice(0, 150) || 'CV.pdf';
}

function required(type, body, keys) {
  const missing = keys.filter(function (k) {
    return !String(body[k] || '').trim();
  });
  if (missing.length > 0) {
    throw new Error('Missing required field(s): ' + missing.join(', '));
  }
}

function formatFields(type, body) {
  const clean = function (v) {
    return String(v || '').trim().slice(0, 4000) || 'Not provided';
  };

  if (type === 'consult') {
    required(type, body, ['name', 'email', 'subject', 'message']);
    return [
      'Client Consultation Request — MOADE Associates',
      '',
      'Name: ' + clean(body.name),
      'Email: ' + clean(body.email),
      'Phone: ' + clean(body.phone),
      'Practice Area: ' + clean(body.practice),
      '',
      'Subject: ' + clean(body.subject),
      '',
      'Matter Details:',
      clean(body.message),
    ];
  }

  if (type === 'speak') {
    required(type, body, ['name', 'email', 'subject', 'body']);
    return [
      'Speak to a Lawyer Request — MOADE Associates',
      '',
      'From: ' + clean(body.name) + ' (' + clean(body.email) + ')',
      'Phone: ' + clean(body.phone),
      'Practice Area: ' + clean(body.practice),
      '',
      'Subject: ' + clean(body.subject),
      '',
      'Body / Matter Description:',
      clean(body.body),
    ];
  }

  // employment
  required(type, body, ['firstName', 'lastName', 'email', 'phone', 'address', 'position']);
  return [
    'APPLICATION FOR EMPLOYMENT — MOADE Associates',
    '',
    'CANDIDATE DETAILS:',
    'First Name: ' + clean(body.firstName),
    'Last Name: ' + clean(body.lastName),
    'Email: ' + clean(body.email),
    'Phone Number: ' + clean(body.phone),
    'Current Address: ' + clean(body.address),
    'Position Applied For: ' + clean(body.position),
    '',
    'APPLICATION UPLOADS:',
    'Resume / CV: ' + (body.attachment && body.attachment.filename ? sanitizeFilename(body.attachment.filename) : '(not attached — candidate did not include one)'),
    '',
    'Statement of Interest:',
    clean(body.notes),
  ];
}
