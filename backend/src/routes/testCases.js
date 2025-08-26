const express = require('express');
const { body, validationResult } = require('express-validator');
const TestCase = require('../models/TestCase');
const MockAIService = require('../services/mockAIService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate test cases from user story
router.post('/generate', authenticateToken, async (req, res) => {
  const { userStory, testType, complexity, count } = req.body;

  try {
    const testCases = await MockAIService.generateTestCases(userStory, testType, complexity, count);
    res.status(200).json(testCases);
  } catch (error) {
    res.status(500).json({ message: 'Error generating test cases', error: error.message });
  }
});

// Create a new test case
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('expectedOutput').notEmpty().withMessage('Expected output is required'),
  body('steps').isArray({ min: 1 }).withMessage('At least one step is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, userStory, testType, steps, expectedOutput, priority } = req.body;

  try {
    const newTestCase = new TestCase({
      title,
      description,
      userStory,
      testType,
      steps,
      expectedOutput,
      createdBy: req.user._id,
      priority: priority || 'medium'
    });

    await newTestCase.save();
    res.status(201).json(newTestCase);
  } catch (error) {
    res.status(500).json({ message: 'Error creating test case', error: error.message });
  }
});

// Get all test cases
router.get('/', authenticateToken, async (req, res) => {
  try {
    const testCases = await TestCase.find({ createdBy: req.user._id }).populate('assignedTo', 'firstName lastName');
    res.status(200).json(testCases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test cases', error: error.message });
  }
});

// Get a single test case by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id).populate('assignedTo', 'firstName lastName');
    if (!testCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    res.status(200).json(testCase);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test case', error: error.message });
  }
});

// Update a test case
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedTestCase = await TestCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTestCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    res.status(200).json(updatedTestCase);
  } catch (error) {
    res.status(500).json({ message: 'Error updating test case', error: error.message });
  }
});

// Delete a test case
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTestCase = await TestCase.findByIdAndDelete(req.params.id);
    if (!deletedTestCase) {
      return res.status(404).json({ message: 'Test case not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test case', error: error.message });
  }
});

module.exports = router;
