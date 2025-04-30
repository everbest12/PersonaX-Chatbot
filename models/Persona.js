const mongoose = require('mongoose');

const PersonaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  profession: {
    type: String,
    required: true,
    enum: ['doctor', 'therapist', 'developer', 'teacher', 'pastor', 'lawyer', 'custom']
  },
  avatar: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  personality: {
    type: String,
    required: true
  },
  tone: {
    type: String,
    required: true,
    enum: ['professional', 'friendly', 'formal', 'casual', 'empathetic']
  },
  knowledgeBase: [{
    type: String
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  voiceSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    voiceType: {
      type: String,
      default: 'default'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PersonaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Persona', PersonaSchema); 