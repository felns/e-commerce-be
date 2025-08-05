const mongoose = require('mongoose');

/**
 * Category schema for grouping products.  Each category has a unique name and
 * an optional description.  Categories can be used to filter products on the
 * frontend.  Timestamps are enabled to track creation and updates.
 */
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);