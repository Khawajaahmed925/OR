const express = require('express');
const LeadProcessor = require('../services/lead-processor');

const router = express.Router();

// Initialize lead processor
let leadProcessor;
try {
  leadProcessor = new LeadProcessor();
} catch (error) {
  console.error('Failed to initialize lead processor:', error.message);
}

/**
 * GET /leads - Get leads with filtering and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    if (!leadProcessor) {
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Lead processor is not properly configured. Please check Supabase connection.'
      });
    }

    const {
      industry,
      city,
      validated,
      outreach_sent,
      employee_id,
      min_score,
      page = 1,
      limit = 50
    } = req.query;

    const filters = {};
    if (industry) filters.industry = industry;
    if (city) filters.city = city;
    if (validated !== undefined) filters.validated = validated === 'true';
    if (outreach_sent !== undefined) filters.outreach_sent = outreach_sent === 'true';
    if (employee_id) filters.employee_id = employee_id;
    if (min_score) filters.min_score = parseFloat(min_score);

    const result = await leadProcessor.getLeads(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching leads:', error);
    next(error);
  }
});

/**
 * GET /leads/statistics - Get lead statistics
 */
router.get('/statistics', async (req, res, next) => {
  try {
    if (!leadProcessor) {
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Lead processor is not properly configured.'
      });
    }

    const stats = await leadProcessor.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching lead statistics:', error);
    next(error);
  }
});

/**
 * PUT /leads/:id - Update lead
 */
router.put('/:id', async (req, res, next) => {
  try {
    if (!leadProcessor) {
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Lead processor is not properly configured.'
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Validate updates
    const allowedFields = [
      'contact_name', 'role_title', 'email', 'phone', 'website',
      'validated', 'outreach_sent', 'response_received', 'converted',
      'relevance_score', 'contact_role_score', 'location_score',
      'completeness_score', 'online_presence_score'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedLead = await leadProcessor.updateLead(id, filteredUpdates);
    res.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    next(error);
  }
});

/**
 * DELETE /leads/:id - Delete lead
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!leadProcessor) {
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Lead processor is not properly configured.'
      });
    }

    const { id } = req.params;
    await leadProcessor.deleteLead(id);
    
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    next(error);
  }
});

/**
 * POST /leads/process - Manually process lead data
 */
router.post('/process', async (req, res, next) => {
  try {
    if (!leadProcessor) {
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Lead processor is not properly configured.'
      });
    }

    const { output, employee_id } = req.body;

    if (!output || !employee_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'output and employee_id are required'
      });
    }

    const result = await leadProcessor.processLeadData(output, employee_id);
    res.json(result);
  } catch (error) {
    console.error('Error processing lead data:', error);
    next(error);
  }
});

module.exports = router;