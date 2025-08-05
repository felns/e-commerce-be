const Category = require('../models/category');

/**
 * Fetch all categories.  Returns an array of category documents.  No
 * authorization is required for this operation.
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new category.  Requires admin privileges.  Validates that the
 * category name is provided and that it does not already exist.
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }
    const category = new Category({ name, description });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing category by ID.  Requires admin privileges.  Only fields
 * provided in the request body will be updated.  If the category is not
 * found, a 404 response is returned.
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (name) category.name = name;
    if (description) category.description = description;
    const updated = await category.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a category by ID.  Requires admin privileges.  If the category
 * does not exist, a 404 response is returned.
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};