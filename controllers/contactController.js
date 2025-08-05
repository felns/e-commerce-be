const ContactMessage = require('../models/contactMessage');

/**
 * Handle contact form submissions.  Requires name, email and message.  The
 * subject field is optional.  Stores the message in the database and
 * returns a confirmation message.  No authentication is required.
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: 'Name, email and message are required' });
    }
    const contact = new ContactMessage({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: 'Message received' });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve all contact messages.  This endpoint is restricted to admin
 * users.  Returns an array of contact messages sorted by creation date.
 */
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};