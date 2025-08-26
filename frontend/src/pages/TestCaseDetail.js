import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testCaseAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

const TestCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTestCase, setEditedTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestCase();
  }, [id]);

  const fetchTestCase = async () => {
    try {
      const response = await testCaseAPI.getTestCase(id);
      setTestCase(response.data);
      setEditedTestCase(response.data);
    } catch (error) {
      toast.error('Failed to fetch test case');
      navigate('/test-cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await testCaseAPI.updateTestCase(id, editedTestCase);
      setTestCase(response.data);
      setEditedTestCase(response.data);
      setIsEditing(false);
      toast.success('Test case updated successfully');
    } catch (error) {
      toast.error('Failed to update test case');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await testCaseAPI.deleteTestCase(id);
        toast.success('Test case deleted successfully');
        navigate('/test-cases');
      } catch (error) {
        toast.error('Failed to delete test case');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditedTestCase(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...editedTestCase.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    handleInputChange('steps', updatedSteps);
  };

  const addStep = () => {
    const newStep = {
      stepNumber: editedTestCase.steps.length + 1,
      action: '',
      expectedResult: ''
    };
    handleInputChange('steps', [...editedTestCase.steps, newStep]);
  };

  const removeStep = (index) => {
    const updatedSteps = editedTestCase.steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    handleInputChange('steps', renumberedSteps);
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: <Clock className="h-5 w-5 text-gray-400" />,
      in_progress: <AlertCircle className="h-5 w-5 text-warning-500" />,
      passed: <CheckCircle className="h-5 w-5 text-success-500" />,
      failed: <XCircle className="h-5 w-5 text-danger-500" />,
      blocked: <XCircle className="h-5 w-5 text-gray-500" />
    };
    return icons[status] || icons.not_started;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!testCase) {
    return <div>Test case not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/test-cases')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Test Case Details</h1>
            <p className="text-gray-600">TC-{testCase._id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 bg-danger-600 text-white px-4 py-2 rounded-lg hover:bg-danger-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTestCase(testCase);
                }}
                className="flex items-center space-x-2 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTestCase.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{testCase.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                {isEditing ? (
                  <select
                    value={editedTestCase.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testCase.status)}
                    <span className="capitalize">{testCase.status.replace('_', ' ')}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Type</label>
                {isEditing ? (
                  <select
                    value={editedTestCase.testType}
                    onChange={(e) => handleInputChange('testType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="functional">Functional</option>
                    <option value="edge">Edge Case</option>
                    <option value="negative">Negative</option>
                    <option value="regression">Regression</option>
                    <option value="performance">Performance</option>
                  </select>
                ) : (
                  <p className="capitalize">{testCase.testType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                {isEditing ? (
                  <select
                    value={editedTestCase.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <p className="capitalize">{testCase.priority}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              {isEditing ? (
                <textarea
                  value={editedTestCase.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-gray-900">{testCase.description}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">User Story</label>
              {isEditing ? (
                <textarea
                  value={editedTestCase.userStory}
                  onChange={(e) => handleInputChange('userStory', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-gray-900">{testCase.userStory}</p>
              )}
            </div>
          </div>

          {/* Test Steps */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Test Steps</h2>
              {isEditing && (
                <button
                  onClick={addStep}
                  className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                >
                  Add Step
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {(isEditing ? editedTestCase.steps : testCase.steps).map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-800">{step.stepNumber}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          placeholder="Action to perform..."
                          value={step.action}
                          onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="Expected result..."
                          value={step.expectedResult}
                          onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </>
                    ) : (
                      <>
                        <p className="font-medium">{step.action}</p>
                        <p className="text-gray-600">→ {step.expectedResult}</p>
                      </>
                    )}
                  </div>
                  
                  {isEditing && (
                    <button
                      onClick={() => removeStep(index)}
                      className="p-1 text-danger-600 hover:text-danger-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expected Output */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Expected Output</h2>
            {isEditing ? (
              <textarea
                value={editedTestCase.expectedOutput}
                onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{testCase.expectedOutput}</p>
            )}
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Metadata</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(testCase.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {new Date(testCase.updatedAt).toLocaleString()}
                </p>
              </div>
              {testCase.aiGenerated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">AI Generated</label>
                  <p className="text-sm text-success-600">Yes ({testCase.aiModel})</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Data */}
          {testCase.testData && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Test Data</h2>
              {isEditing ? (
                <textarea
                  value={editedTestCase.testData}
                  onChange={(e) => handleInputChange('testData', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <p className="text-gray-900">{testCase.testData}</p>
              )}
            </div>
          )}

          {/* Preconditions */}
          {testCase.preconditions && testCase.preconditions.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">Preconditions</h2>
              <ul className="list-disc list-inside space-y-1">
                {testCase.preconditions.map((precondition, index) => (
                  <li key={index} className="text-sm text-gray-700">{precondition}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetail;
