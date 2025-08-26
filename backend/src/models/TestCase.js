const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  userStory: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['functional', 'edge', 'negative', 'regression', 'performance'],
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    expectedResult: {
      type: String,
      required: true
    }
  }],
  preconditions: [{
    type: String
  }],
  postconditions: [{
    type: String
  }],
  testData: {
    type: String
  },
  expectedOutput: {
    type: String,
    required: true
  },
  actualOutput: {
    type: String
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'passed', 'failed', 'blocked'],
    default: 'not_started'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiGenerated: {
    type: Boolean,
    default: true
  },
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  aiPrompt: {
    type: String
  },
  complexity: {
    type: String,
    enum: ['simple', 'medium', 'complex'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number // in minutes
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for better query performance
testCaseSchema.index({ createdBy: 1, createdAt: -1 });
testCaseSchema.index({ project: 1, status: 1 });
testCaseSchema.index({ tags: 1 });
testCaseSchema.index({ aiGenerated: 1 });

// Virtual for full test case ID
testCaseSchema.virtual('testCaseId').get(function() {
  return `TC-${this._id.toString().substring(0, 8).toUpperCase()}`;
});

// Method to add comment
testCaseSchema.methods.addComment = function(userId, comment) {
  this.comments.push({
    user: userId,
    comment: comment
  });
  return this.save();
};

// Method to update status
testCaseSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('TestCase', testCaseSchema);
