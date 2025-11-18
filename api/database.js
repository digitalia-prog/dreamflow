const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dreamflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  }
};

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ['FREE', 'PRO', 'AGENCY'], default: 'FREE' },
  scriptsUsed: { type: Number, default: 0 },
  scriptsLimit: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
  apiKey: String,
});

// Script schema
const scriptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  content: String,
  network: String,
  language: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Script = mongoose.model('Script', scriptSchema);

module.exports = { connectDB, User, Script };
