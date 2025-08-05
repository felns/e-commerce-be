const mongoose = require('mongoose');

/**
 * ContactMessage schema stores messages sent via the contact form.  It
 * captures the sender's name, email, an optional subject and the message
 * content.  A timestamp records when each message was created.
 */
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);