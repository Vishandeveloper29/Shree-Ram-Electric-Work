const mongoose = require('mongoose');

const pitchTurnSchema = new mongoose.Schema({
  pitch: { type: String },
  turns: { type: Number }
}, { _id: false });

const motorSchema = new mongoose.Schema({
  // Nameplate
  brand: { type: String, required: true, trim: true },
  manufacturer: { type: String, trim: true },
  motorType: { type: String, enum: ['AC', 'DC'], required: true },
  phase: { type: String, enum: ['Single', 'Three'], required: true },
  ratedVoltage: { type: String },
  ratedCurrent: { type: String },
  ratedFrequency: { type: String },
  ratedRPM: { type: Number },
  ratedPowerHP: { type: Number },
  ratedPowerKW: { type: Number },
  insulationClass: { type: String, enum: ['A', 'B', 'F', 'H', ''] },
  efficiency: { type: String },
  frameSize: { type: String },

  // Electrical
  runningCurrent: { type: String },

  // Winding
  statorSlots: { type: Number },
  slotLength: { type: String },
  totalCoilTurns: { type: Number },
  turnsPerCoil: { type: Number },
  coilPitch: { type: String },
  windingConnection: { type: String },
  coilWireType: { type: String, enum: ['Copper', 'Aluminium', ''] },
  wireGauge: { type: String },
  coilWeight: { type: Number },
  pitchTurns: [pitchTurnSchema],

  // Single Phase
  startingCoilTurns: { type: Number },
  runningCoilTurns: { type: Number },
  startingCoilWeight: { type: Number },
  runningCoilWeight: { type: Number },
  capacitorValue: { type: String },

  // Three Phase
  lineVoltage: { type: String },
  phaseVoltage: { type: String },
  lineCurrent: { type: String },
  phaseCurrent: { type: String },
  starDeltaConn: { type: String },

  // Mechanical
  shaftDiameter: { type: String },
  shaftLength: { type: String },
  bearingFront: { type: String },
  bearingRear: { type: String },
  fanSize: { type: String },
  fanCoverSize: { type: String },
  motorWeight: { type: Number },
  bodyMaterial: { type: String },

  // Repair History
  oldCoilWeight: { type: Number },
  newCoilWeight: { type: Number },
  notes: { type: String },

}, { timestamps: true });

// Text index for search
motorSchema.index({ brand: 'text', manufacturer: 'text', frameSize: 'text', notes: 'text' });

module.exports = mongoose.model('Motor', motorSchema);
