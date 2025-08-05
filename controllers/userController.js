const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Register a new user.  Validates required fields, ensures the email is
 * unique, hashes the password and saves the user document.  Does not
 * automatically return a token; clients should call the login endpoint
 * afterwards.
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Authenticate a user and issue a JWT token.  Validates credentials and
 * compares the provided password with the stored hash.  Returns a token
 * containing the user's ID and role.
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { id: user._id, role: user.role };
    const secret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(payload, secret, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

/**
 * Get the authenticated user's profile.  Returns the user details except the
 * password.
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Update the authenticated user's profile.  Accepts any of the user
 * editable fields (name, email, phone, address).  To change the password,
 * supply a new `password` field; it will be hashed automatically.
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { name, email, phone, address, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    const updated = await user.save();
    const safeUser = updated.toObject();
    delete safeUser.password;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all users.  Admin only.  Returns an array of users without their
 * password fields.
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a user by ID.  Admin only.  Returns the user details without the
 * password field.
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a user by ID.  Admin only.  Supports changing name, email,
 * phone, address and role.  Password changes should be done by the user
 * themselves via the profile endpoint.  Returns the updated user.
 */
exports.updateUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { name, email, phone, address, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }
    if (role) user.role = role;
    const updated = await user.save();
    const safeUser = updated.toObject();
    delete safeUser.password;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a user by ID.  Admin only.  Returns a confirmation message if
 * deletion succeeds or a 404 error if the user does not exist.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed' });
  } catch (err) {
    next(err);
  }
};