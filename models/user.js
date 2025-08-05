const mongoose = require('mongoose');

/**
 * User schema representing application users.  In addition to basic fields
 * (name, email, password), users have a role (`user` or `admin`), contact
 * details and an address.  The password field stores a hashed value.  The
 * address subdocument allows storing structured shipping or billing
 * information.  Timestamps are enabled to track when each document was
 * created and last updated.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User_ray', userSchema);