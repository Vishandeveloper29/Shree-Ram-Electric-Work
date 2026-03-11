const express = require('express');
const router = express.Router();
const auth = require('./middleware');
const {
  login, changePassword,
  getMotors, getMotorById, createMotor, updateMotor, deleteMotor,
  getStats, getBrands,
} = require('./controller');

// Public routes
router.post('/auth/login', login);
router.get('/motors', getMotors);
router.get('/motors/stats', getStats);
router.get('/motors/brands', getBrands);
router.get('/motors/:id', getMotorById);

// Protected admin routes
router.post('/auth/change-password', auth, changePassword);
router.post('/motors', auth, createMotor);
router.put('/motors/:id', auth, updateMotor);
router.delete('/motors/:id', auth, deleteMotor);

module.exports = router;
