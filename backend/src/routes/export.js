const express = require('express');
const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const { Readable } = require('stream');
const TestCase = require('../models/TestCase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Export test cases to CSV
router.get('/csv', authenticateToken, async (req, res) => {
  try {
    const testCases = await TestCase.find({ createdBy: req.user._id }).populate('assignedTo', 'firstName lastName');
    
    if (testCases.length === 0) {
      return res.status(404).json({ message: 'No test cases found to export' });
    }

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test-cases.csv');

    // Create CSV content
    let csvContent = 'Test Case ID,Title,Description,Test Type,Priority,Status,Assigned To,Expected Output\n';
    
    testCases.forEach(testCase => {
      const assignedTo = testCase.assignedTo ? `${testCase.assignedTo.firstName} ${testCase.assignedTo.lastName}` : 'Unassigned';
      const testCaseId = `TC-${testCase._id.toString().substring(0, 8).toUpperCase()}`;
      
      csvContent += `"${testCaseId}","${escapeCSV(testCase.title)}","${escapeCSV(testCase.description)}",` +
                   `"${testCase.testType}","${testCase.priority}","${testCase.status}",` +
                   `"${assignedTo}","${escapeCSV(testCase.expectedOutput)}"\n`;
    });

    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting to CSV', error: error.message });
  }
});

// Export test cases to Excel
router.get('/excel', authenticateToken, async (req, res) => {
  try {
    const testCases = await TestCase.find({ createdBy: req.user._id }).populate('assignedTo', 'firstName lastName');
    
    if (testCases.length === 0) {
      return res.status(404).json({ message: 'No test cases found to export' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Cases');

    // Add headers
    worksheet.columns = [
      { header: 'Test Case ID', key: 'testCaseId', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Test Type', key: 'testType', width: 15 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Expected Output', key: 'expectedOutput', width: 40 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Add data
    testCases.forEach(testCase => {
      const assignedTo = testCase.assignedTo ? `${testCase.assignedTo.firstName} ${testCase.assignedTo.lastName}` : 'Unassigned';
      const testCaseId = `TC-${testCase._id.toString().substring(0, 8).toUpperCase()}`;
      
      worksheet.addRow({
        testCaseId,
        title: testCase.title,
        description: testCase.description,
        testType: testCase.testType,
        priority: testCase.priority,
        status: testCase.status,
        assignedTo,
        expectedOutput: testCase.expectedOutput,
        createdAt: testCase.createdAt.toLocaleDateString()
      });
    });

    // Style the header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6E6' }
      };
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=test-cases.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting to Excel', error: error.message });
  }
});

// Import test cases from CSV
router.post('/import/csv', authenticateToken, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file;
    const testCases = [];

    const stream = Readable.from(file.data.toString());
    stream
      .pipe(csv())
      .on('data', (row) => {
        testCases.push({
          title: row.Title,
          description: row.Description,
          testType: row['Test Type'] || 'functional',
          priority: row.Priority || 'medium',
          expectedOutput: row['Expected Output'],
          createdBy: req.user._id
        });
      })
      .on('end', async () => {
        try {
          const savedTestCases = await TestCase.insertMany(testCases);
          res.status(201).json({ message: `${savedTestCases.length} test cases imported successfully` });
        } catch (error) {
          res.status(500).json({ message: 'Error saving imported test cases', error: error.message });
        }
      })
      .on('error', (error) => {
        res.status(400).json({ message: 'Error parsing CSV file', error: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error importing CSV', error: error.message });
  }
});

// Helper function to escape CSV values
function escapeCSV(value) {
  if (typeof value === 'string') {
    return value.replace(/"/g, '""');
  }
  return value;
}

module.exports = router;
