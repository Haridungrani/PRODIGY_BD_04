const User = require('../models/User');
const { redisClient } = require('../config/redis');
const { isValidUser, isValidEmail } = require('../utils/validate');

const CACHE_TTL = 60; // seconds

exports.createUser = async (req, res) => {
  const { name, email, age } = req.body;

  if (!isValidUser(name, email, age)) {
    return res.status(400).json({ error: 'Invalid input fields' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    const newUser = new User({ name, email, age });
    await newUser.save();
    await redisClient.del('users');

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const cached = await redisClient.get('users');
    if (cached) return res.json(JSON.parse(cached));

    const users = await User.find();
    await redisClient.setEx('users', CACHE_TTL, JSON.stringify(users));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'Email not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { name, email, age } = req.body;

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'User not found' });

    await redisClient.del('users');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await redisClient.del('users');
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
