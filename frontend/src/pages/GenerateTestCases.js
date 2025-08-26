import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { testCaseAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Sparkles, Save, Download } from 'lucide-react';

const GenerateTestCases = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    userStory: '',
    testType: 'functional',
    complexity: 'medium',
    count: 5
  });
  const [generatedTestCases, setGeneratedTestCases] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const response = await testCaseAPI.generateTestCases(formData);
      setGeneratedTestCases(response.data);
      toast.success('Test cases generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate test cases');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const savePromises = generatedTestCases.map(testCase =>
        testCaseAPI.createTestCase(testCase)
      );
      await Promise.all(savePromises);
      toast.success('All test cases saved successfully!');
      setGeneratedTestCases([]);
    } catch (error) {
      toast.error('Failed to save test cases');
    } finally {
      setIsSaving(false);
    }
  };

  const TestCaseCard = ({ testCase, index }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{testCase.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          testCase.priority === 'high' ? 'bg-danger-100 text-danger-800' :
          testCase.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
          'bg-success-100 text-success-800'
        }`}>
          {testCase.priority}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{testCase.description}</p>
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">Test Steps:</h4>
        <ol className="list-decimal list-inside space-y-1">
          {testCase.steps.map((step, stepIndex) => (
            <li key={stepIndex} className="text-sm text-gray-700">
              <strong>Step {step.stepNumber}:</strong> {step.action} → {step.expectedResult}
            </li>
          ))}
        </ol>
      </div>

      {testCase.preconditions && testCase.preconditions.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Preconditions:</h4>
          <ul className="list-disc list-inside space-y-1">
            {testCase.preconditions.map((precondition, idx) => (
              <li key={idx} className="text-sm text-gray-700">{precondition}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-medium mb-2">Expected Output:</h4>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{testCase.expectedOutput}</p>
      </div>

      {testCase.testData && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Test Data:</h4>
          <p className="text-sm text-gray-700">{testCase.testData}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Generate Test Cases</h1>
        {generatedTestCases.length > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Story / Feature Description
            </label>
            <textarea
              name="userStory"
              value={formData.userStory}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="As a user, I want to be able to login to the system so that I can access my account..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                name="testType"
                value={formData.testType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="functional">Functional</option>
                <option value="edge">Edge Cases</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity
              </label>
              <select
                name="complexity"
                value={formData.complexity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="simple">Simple</option>
                <option value="medium">Medium</option>
                <option value="complex">Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Test Cases
              </label>
              <input
                type="number"
                name="count"
                value={formData.count}
                onChange={handleInputChange}
                min={1}
                max={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{isGenerating ? 'Generating...' : 'Generate Test Cases'}</span>
          </button>
        </form>
      </div>

      {/* Generated Test Cases */}
      {generatedTestCases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Test Cases ({generatedTestCases.length})</h2>
          {generatedTestCases.map((testCase, index) => (
            <TestCaseCard key={index} testCase={testCase} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTestCases;
