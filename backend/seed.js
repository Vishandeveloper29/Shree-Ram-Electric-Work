require('dotenv').config({path:__dirname + "/.env"})
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Motor = require('./models/Motor');
const bcrypt = require('bcryptjs');
const connectDB = require("./connection")
const seed = async () => {
   await connectDB()

  // Create admin
  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    await Admin.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    console.log(`✅ Admin created: ${process.env.ADMIN_EMAIL}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  // Sample motors
  const count = await Motor.countDocuments();
  if (count === 0) {
    await Motor.insertMany([
      {
        brand: 'Crompton', manufacturer: 'Crompton Greaves', motorType: 'AC', phase: 'Single',
        ratedVoltage: '230V', ratedCurrent: '8.5A', ratedFrequency: '50Hz', ratedRPM: 1440,
        ratedPowerHP: 1.5, ratedPowerKW: 1.118, insulationClass: 'B', efficiency: '82%',
        frameSize: 'D90S', wireGauge: '22 SWG', coilWeight: 1.15, turnsPerCoil: 90,
        startingCoilTurns: 480, runningCoilTurns: 240, capacitorValue: '25µF',
        bearingFront: '6305', bearingRear: '6203', bodyMaterial: 'Cast Iron',
      },
      {
        brand: 'ABB', manufacturer: 'ABB India Ltd', motorType: 'AC', phase: 'Three',
        ratedVoltage: '415V', ratedCurrent: '7.8A', ratedFrequency: '50Hz', ratedRPM: 1440,
        ratedPowerHP: 5, ratedPowerKW: 3.729, insulationClass: 'F', efficiency: '88%',
        frameSize: 'D112M', wireGauge: '20 SWG', coilWeight: 2.4, turnsPerCoil: 60,
        starDeltaConn: 'Star', lineVoltage: '415V', phaseVoltage: '240V',
        bearingFront: '6308', bearingRear: '6205', bodyMaterial: 'Cast Iron',
      },
      {
        brand: 'Kirloskar', manufacturer: 'Kirloskar Electric', motorType: 'AC', phase: 'Three',
        ratedVoltage: '415V', ratedCurrent: '5.2A', ratedFrequency: '50Hz', ratedRPM: 2880,
        ratedPowerHP: 3, ratedPowerKW: 2.237, insulationClass: 'F', efficiency: '85%',
        frameSize: 'D100L', wireGauge: '21 SWG', coilWeight: 1.8, turnsPerCoil: 72,
        starDeltaConn: 'Delta', bearingFront: '6306', bearingRear: '6204', bodyMaterial: 'Aluminium',
      },
      {
        brand: 'Havells', manufacturer: 'Havells India', motorType: 'AC', phase: 'Single',
        ratedVoltage: '230V', ratedCurrent: '6A', ratedFrequency: '50Hz', ratedRPM: 1440,
        ratedPowerHP: 1, ratedPowerKW: 0.746, insulationClass: 'B', efficiency: '80%',
        frameSize: 'D80', wireGauge: '23 SWG', coilWeight: 0.85,
        startingCoilTurns: 400, runningCoilTurns: 200, capacitorValue: '16µF',
        bearingFront: '6304', bearingRear: '6202', bodyMaterial: 'Aluminium',
      },
      {
        brand: 'Siemens', manufacturer: 'Siemens India', motorType: 'AC', phase: 'Three',
        ratedVoltage: '415V', ratedCurrent: '11A', ratedFrequency: '50Hz', ratedRPM: 1450,
        ratedPowerHP: 7.5, ratedPowerKW: 5.593, insulationClass: 'F', efficiency: '90%',
        frameSize: 'D132S', wireGauge: '19 SWG', coilWeight: 3.1,
        starDeltaConn: 'Star', bearingFront: '6309', bearingRear: '6206', bodyMaterial: 'Cast Iron',
      },
    ]);
    console.log('✅ Sample motors inserted.');
  } else {
    console.log(`${count} motors already exist, skipping sample data.`);
  }

};

seed()