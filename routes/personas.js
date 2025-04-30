const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Persona = require('../models/Persona');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all public personas
router.get('/public', async (req, res) => {
  try {
    const personas = await Persona.find({ isPublic: true })
      .select('name profession avatar description tone');
    res.json(personas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's saved personas
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('savedBots');
    res.json(user.savedBots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new persona
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      profession,
      avatar,
      description,
      personality,
      tone,
      knowledgeBase,
      isPublic
    } = req.body;

    const persona = new Persona({
      name,
      profession,
      avatar,
      description,
      personality,
      tone,
      knowledgeBase,
      isPublic,
      creator: req.userId
    });

    await persona.save();
    res.status(201).json(persona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update persona
router.put('/:id', auth, async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    if (persona.creator.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const {
      name,
      profession,
      avatar,
      description,
      personality,
      tone,
      knowledgeBase,
      isPublic
    } = req.body;

    persona.name = name || persona.name;
    persona.profession = profession || persona.profession;
    persona.avatar = avatar || persona.avatar;
    persona.description = description || persona.description;
    persona.personality = personality || persona.personality;
    persona.tone = tone || persona.tone;
    persona.knowledgeBase = knowledgeBase || persona.knowledgeBase;
    persona.isPublic = isPublic !== undefined ? isPublic : persona.isPublic;

    await persona.save();
    res.json(persona);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete persona
router.delete('/:id', auth, async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    if (persona.creator.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await persona.remove();
    res.json({ message: 'Persona deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save persona to user's collection
router.post('/:id/save', auth, async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    const user = await User.findById(req.userId);
    if (user.savedBots.includes(persona._id)) {
      return res.status(400).json({ message: 'Persona already saved' });
    }

    user.savedBots.push(persona._id);
    await user.save();
    res.json({ message: 'Persona saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove persona from user's collection
router.delete('/:id/save', auth, async (req, res) => {
  try {
    const persona = await Persona.findById(req.params.id);
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    const user = await User.findById(req.userId);
    user.savedBots = user.savedBots.filter(id => id.toString() !== persona._id.toString());
    await user.save();
    res.json({ message: 'Persona removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 