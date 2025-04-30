const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const Persona = require('../models/Persona');
const OpenAI = require('openai');

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

// Initialize OpenAI with error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI:', error);
  // Don't throw here, let the server start and handle API calls gracefully
}

// Create new chat
router.post('/', auth, async (req, res) => {
  try {
    const { personaId } = req.body;
    
    const persona = await Persona.findById(personaId);
    if (!persona) {
      return res.status(404).json({ message: 'Persona not found' });
    }

    const chat = new Chat({
      user: req.userId,
      persona: personaId
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all chats for user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.userId })
      .populate('persona', 'name avatar profession')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single chat
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('persona', 'name avatar profession personality tone');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ message: 'OpenAI service is not available' });
    }

    const { content, file } = req.body;
    const chat = await Chat.findById(req.params.id)
      .populate('persona', 'name avatar profession personality tone');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add user message
    chat.messages.push({
      content,
      sender: 'user',
      file
    });

    // Generate AI response
    const messages = chat.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are ${chat.persona.name}, a ${chat.persona.profession}. Your personality is: ${chat.persona.personality}. Your tone should be ${chat.persona.tone}.`
        },
        ...messages
      ]
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response
    chat.messages.push({
      content: aiResponse,
      sender: 'bot'
    });

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Error in chat message:', error);
    res.status(500).json({ 
      message: 'Error processing chat message',
      error: error.message 
    });
  }
});

// Delete chat
router.delete('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await chat.remove();
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle bookmark
router.patch('/:id/bookmark', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    chat.isBookmarked = !chat.isBookmarked;
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 