import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { testCaseAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  TestTube2, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [testCases, setTestCases] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    inProgress: 0,
    notStarted: 0
  });

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const response = await testCaseAPI.getTestCases();
      const testCasesData = response.data;
      setTestCases(testCasesData);

      // Calculate statistics
      const stats = {
        total: testCasesData.length,
        passed: testCasesData.filter(tc => tc.status === 'passed').length,
        failed: testCasesData.filter(tc => tc.status === 'failed').length,
        inProgress: testCasesData.filter(tc => tc.status === 'in_progress').length,
        notStarted: testCasesData.filter(tc => tc.status === 'not_started').length
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to fetch test cases');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const RecentTestCase = ({ testCase }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <TestTube2 className="h-5 w-5 text-primary-600" />
        <div>
          <h4 className="font-medium text-gray-900">{testCase.title}</h4>
          <p className="text-sm text-gray-600">{testCase.testType}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        testCase.status === 'passed' ? 'bg-success-100 text-success-800' :
        testCase.status === 'failed' ? 'bg-danger-100 text-danger-800' :
        testCase.status === 'in_progress' ? 'bg-warning-100 text-warning-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {testCase.status.replace('_', ' ')}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
        <p className="text-primary-100">Ready to generate some amazing test cases?</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Test Cases"
          value={stats.total}
          icon={FileText}
          color="bg-primary-500"
        />
        <StatCard
          title="Passed"
          value={stats.passed}
          icon={CheckCircle}
          color="bg-success-500"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="bg-warning-500"
        />
        <StatCard
          title="Not Started"
          value={stats.notStarted}
          icon={AlertCircle}
          color="bg-gray-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generate New */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold">Generate Test Cases</h3>
          </div>
          <p className="text-gray-600 mb-4">Use AI to generate comprehensive test cases from user stories</p>
          <a
            href="/generate"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Start Generating
          </a>
        </div>

        {/* View All */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold">View Test Cases</h3>
          </div>
          <p className="text-gray-600 mb-4">Browse and manage all your generated test cases</p>
          <a
            href="/test-cases"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            View All
          </a>
        </div>
      </div>

      {/* Recent Test Cases */}
      {testCases.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Test Cases</h3>
          <div className="space-y-3">
            {testCases.slice(0, 5).map((testCase) => (
              <RecentTestCase key={testCase._id} testCase={testCase} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
