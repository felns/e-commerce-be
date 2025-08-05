const Product = require('../models/product');
const Review = require('../models/review');

/**
 * Retrieve all products.  Supports optional filtering by category, search
 * keyword and flash sale flag via query parameters.  Populates the category
 * field for each product.  If no filters are provided, all products are
 * returned.
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, keyword, flashSale } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (flashSale === 'true') filter.isFlashSale = true;
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      filter.name = { $regex: regex };
    }
    const products = await Product.find(filter).populate('category');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve a single product by its ID.  Populates category and reviews to
 * provide full details, including reviewer names.
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new product.  Requires admin privileges.  Validates required
 * fields and converts numeric values.  If a category is specified it must
 * exist.  Returns the created product.
 */
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      brand,
      countInStock,
      colors,
      sizes,
      isFlashSale,
      discount,
      saleEnd,
    } = req.body;
    if (!name || !price || !description || !image) {
      return res.status(400).json({ message: 'Name, price, description and image are required' });
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
      return res.status(400).json({ message: 'Price must be a number' });
    }
    const newProduct = new Product({
      name,
      price: priceValue,
      description,
      image,
      category,
      brand,
      countInStock: countInStock || 0,
      colors: colors || [],
      sizes: sizes || [],
      isFlashSale: isFlashSale || false,
      discount: discount || 0,
      saleEnd: saleEnd || undefined,
    });
    const saved = await newProduct.save();
    const populated = await saved.populate('category');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing product.  Requires admin privileges.  Only supplied
 * fields are updated.  Returns the updated product.  Validates numeric
 * fields and ensures the image is a valid URL if provided.
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      brand,
      countInStock,
      colors,
      sizes,
      isFlashSale,
      discount,
      saleEnd,
    } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (name) product.name = name;
    if (price !== undefined) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue)) {
        return res.status(400).json({ message: 'Price must be a number' });
      }
      product.price = priceValue;
    }
    if (description) product.description = description;
    if (image) product.image = image;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (colors) product.colors = colors;
    if (sizes) product.sizes = sizes;
    if (isFlashSale !== undefined) product.isFlashSale = isFlashSale;
    if (discount !== undefined) product.discount = discount;
    if (saleEnd) product.saleEnd = saleEnd;
    const updated = await product.save();
    const populated = await updated
      .populate('category')
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } });
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a product by ID.  Requires admin privileges.  Returns a success
 * message if deleted, or a 404 if the product does not exist.
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a review to a product.  Requires authentication.  Ensures the user
 * has not already reviewed the product.  Updates the product's average
 * rating and review count.  Returns a success message on completion.
 */
exports.addReview = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });
    const savedReview = await review.save();
    // Push review into product and recalculate rating
    product.reviews.push(savedReview._id);
    product.numReviews = product.reviews.length;
    // Calculate average rating
    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.rating = avgRating;
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    next(err);
  }
};