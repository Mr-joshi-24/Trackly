const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');

const VALID_STATUSES = ['Interested', 'Applied', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Withdrawn'];
const VALID_JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];

async function findAppById(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await JobApplication.findById(id);
    if (doc) return doc;
  }
  if (!isNaN(id)) {
    return await JobApplication.findOne({ sqlite_id: Number(id) });
  }
  return null;
}

// GET /api/applications - Search & filter applications
router.get('/', async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      filter.$or = [
        { company_name: reg },
        { role: reg },
        { location: reg }
      ];
    }

    const applications = await JobApplication.find(filter).sort({ created_at: -1 });
    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
});

// GET /api/applications/:id - Single application
router.get('/:id', async (req, res, next) => {
  try {
    const appDoc = await findAppById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ success: false, error: 'Job application not found' });
    }
    res.json({ success: true, data: appDoc });
  } catch (err) {
    next(err);
  }
});

// POST /api/applications - Create job application
router.post('/', async (req, res, next) => {
  try {
    const {
      company_name,
      role,
      job_type = 'Full-time',
      location = '',
      application_date = new Date().toISOString().split('T')[0],
      job_url = '',
      status = 'Applied',
      follow_up_date = '',
      notes = ''
    } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ success: false, error: 'Company name is required' });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, error: 'Role/position title is required' });
    }

    const appStatus = VALID_STATUSES.includes(status) ? status : 'Applied';
    const appType = VALID_JOB_TYPES.includes(job_type) ? job_type : 'Full-time';

    const newApp = await JobApplication.create({
      company_name: company_name.trim(),
      role: role.trim(),
      job_type: appType,
      location: location.trim(),
      application_date: application_date.trim(),
      job_url: job_url.trim(),
      status: appStatus,
      follow_up_date: follow_up_date.trim(),
      notes: notes.trim()
    });

    res.status(201).json({ success: true, data: newApp });
  } catch (err) {
    next(err);
  }
});

// PUT /api/applications/:id - Edit job application
router.put('/:id', async (req, res, next) => {
  try {
    const {
      company_name,
      role,
      job_type = 'Full-time',
      location = '',
      application_date = '',
      job_url = '',
      status = 'Applied',
      follow_up_date = '',
      notes = ''
    } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ success: false, error: 'Company name is required' });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, error: 'Role/position title is required' });
    }

    const appDoc = await findAppById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ success: false, error: 'Job application not found' });
    }

    const appStatus = VALID_STATUSES.includes(status) ? status : 'Applied';
    const appType = VALID_JOB_TYPES.includes(job_type) ? job_type : 'Full-time';

    appDoc.company_name = company_name.trim();
    appDoc.role = role.trim();
    appDoc.job_type = appType;
    appDoc.location = location.trim();
    if (application_date) appDoc.application_date = application_date.trim();
    appDoc.job_url = job_url.trim();
    appDoc.status = appStatus;
    appDoc.follow_up_date = follow_up_date.trim();
    appDoc.notes = notes.trim();
    appDoc.updated_at = new Date();

    await appDoc.save();
    res.json({ success: true, data: appDoc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/applications/:id - Delete application
router.delete('/:id', async (req, res, next) => {
  try {
    const appDoc = await findAppById(req.params.id);
    if (!appDoc) {
      return res.status(404).json({ success: false, error: 'Job application not found' });
    }

    await JobApplication.deleteOne({ _id: appDoc._id });
    res.json({ success: true, message: 'Job application deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
