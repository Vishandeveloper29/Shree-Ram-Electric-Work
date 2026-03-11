const jwt = require('jsonwebtoken');
const Admin = require('./models/Admin');
const Motor = require('./models/Motor');

// ─── AUTH ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, message: 'Login successful.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'All fields required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });

    const admin = await Admin.findById(req.admin.id);
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── MOTORS ──────────────────────────────────────────────────
const getMotors = async (req, res) => {
  try {
    const {
      search, motorType, phase, brand,
      hpMin, hpMax, rpmMin, rpmMax,
      ipRating, insulationClass,
      page = 1, limit = 20, sort = 'brand'
    } = req.query;

    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { brand: regex },
        { manufacturer: regex },
        { frameSize: regex },
        { ratedVoltage: regex },
        { wireGauge: regex },
        { notes: regex },
      ];
    }
    if (motorType) filter.motorType = motorType;
    if (phase) filter.phase = phase;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (insulationClass) filter.insulationClass = insulationClass;
    if (hpMin || hpMax) {
      filter.ratedPowerHP = {};
      if (hpMin) filter.ratedPowerHP.$gte = parseFloat(hpMin);
      if (hpMax) filter.ratedPowerHP.$lte = parseFloat(hpMax);
    }
    if (rpmMin || rpmMax) {
      filter.ratedRPM = {};
      if (rpmMin) filter.ratedRPM.$gte = parseInt(rpmMin);
      if (rpmMax) filter.ratedRPM.$lte = parseInt(rpmMax);
    }

    const sortMap = {
      brand: { brand: 1 },
      ratedPowerHP: { ratedPowerHP: -1 },
      ratedRPM: { ratedRPM: -1 },
      frameSize: { frameSize: 1 },
      added: { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || { brand: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [motors, total] = await Promise.all([
      Motor.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Motor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      motors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getMotors error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getMotorById = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id).lean();
    if (!motor) return res.status(404).json({ success: false, message: 'Motor not found.' });
    res.json({ success: true, motor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createMotor = async (req, res) => {
  try {
    const data = req.body;
    if (data.ratedPowerHP) data.ratedPowerKW = +(data.ratedPowerHP * 0.7457).toFixed(3);
    const motor = await Motor.create(data);
    res.status(201).json({ success: true, motor, message: 'Motor created successfully.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateMotor = async (req, res) => {
  try {
    const data = req.body;
    if (data.ratedPowerHP) data.ratedPowerKW = +(data.ratedPowerHP * 0.7457).toFixed(3);
    const motor = await Motor.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });
    if (!motor) return res.status(404).json({ success: false, message: 'Motor not found.' });
    res.json({ success: true, motor, message: 'Motor updated successfully.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteMotor = async (req, res) => {
  try {
    const motor = await Motor.findByIdAndDelete(req.params.id);
    if (!motor) return res.status(404).json({ success: false, message: 'Motor not found.' });
    res.json({ success: true, message: 'Motor deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getStats = async (req, res) => {
  try {
    const [total, acCount, dcCount, singleCount, threeCount, brands] = await Promise.all([
      Motor.countDocuments(),
      Motor.countDocuments({ motorType: 'AC' }),
      Motor.countDocuments({ motorType: 'DC' }),
      Motor.countDocuments({ phase: 'Single' }),
      Motor.countDocuments({ phase: 'Three' }),
      Motor.distinct('brand'),
    ]);
    const recent = await Motor.find().sort({ createdAt: -1 }).limit(5).lean();
    res.json({
      success: true,
      stats: { total, acCount, dcCount, singleCount, threeCount, brandCount: brands.length },
      recent,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await Motor.distinct('brand');
    res.json({ success: true, brands: brands.sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  login, changePassword,
  getMotors, getMotorById, createMotor, updateMotor, deleteMotor,
  getStats, getBrands,
};
