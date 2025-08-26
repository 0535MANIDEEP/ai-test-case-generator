import React, { useState, useEffect } from 'react';
import { testCaseAPI, exportAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  FileText,
  MoreHorizontal
} from 'lucide-react';

const TestCaseList = () => {
  const [testCases, setTestCases] = useState([]);
  const [filteredTestCases, setFilteredTestCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestCases();
  }, []);

  useEffect(() => {
    filterTestCases();
  }, [testCases, searchTerm, statusFilter, typeFilter]);

  const fetchTestCases = async () => {
    try {
      const response = await testCaseAPI.getTestCases();
      setTestCases(response.data);
    } catch (error) {
      toast.error('Failed to fetch test cases');
    } finally {
      setLoading(false);
    }
  };

  const filterTestCases = () => {
    let filtered = testCases;

    if (searchTerm) {
      filtered = filtered.filter(testCase =>
        testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testCase.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(testCase => testCase.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(testCase => testCase.testType === typeFilter);
    }

    setFilteredTestCases(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await testCaseAPI.deleteTestCase(id);
        setTestCases(testCases.filter(tc => tc._id !== id));
        toast.success('Test case deleted successfully');
      } catch (error) {
        toast.error('Failed to delete test case');
      }
    }
  };

  const handleExport = async (format) => {
    try {
      let response;
      if (format === 'csv') {
        response = await exportAPI.exportToCSV();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'test-cases.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (format === 'excel') {
        response = await exportAPI.exportToExcel();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'test-cases.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      toast.success(`Exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error('Failed to export test cases');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      not_started: { color: 'bg-gray-100 text-gray-800', label: 'Not Started' },
      in_progress: { color: 'bg-warning-100 text-warning-800', label: 'In Progress' },
      passed: { color: 'bg-success-100 text-success-800', label: 'Passed' },
      failed: { color: 'bg-danger-100 text-danger-800', label: 'Failed' },
      blocked: { color: 'bg-gray-100 text-gray-800', label: 'Blocked' }
    };
    
    const config = statusConfig[status] || statusConfig.not_started;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      functional: { color: 'bg-primary-100 text-primary-800', label: 'Functional' },
      edge: { color: 'bg-warning-100 text-warning-800', label: 'Edge Case' },
      negative: { color: 'bg-danger-100 text-danger-800', label: 'Negative' },
      regression: { color: 'bg-purple-100 text-purple-800', label: 'Regression' },
      performance: { color: 'bg-blue-100 text-blue-800', label: 'Performance' }
    };
    
    const config = typeConfig[type] || typeConfig.functional;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Test Cases</h1>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="functional">Functional</option>
              <option value="edge">Edge Cases</option>
              <option value="negative">Negative</option>
              <option value="regression">Regression</option>
              <option value="performance">Performance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredTestCases.length} of {testCases.length} test cases
      </div>

      {/* Test Cases Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTestCases.map((testCase) => (
                <tr key={testCase._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{testCase.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{testCase.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(testCase.testType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(testCase.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      testCase.priority === 'high' ? 'bg-danger-100 text-danger-800' :
                      testCase.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {testCase.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(testCase.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/test-cases/${testCase._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(testCase._id)}
                        className="text-danger-600 hover:text-danger-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTestCases.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No test cases found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseList;
