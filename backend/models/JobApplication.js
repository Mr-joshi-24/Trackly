const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  sqlite_id: { type: Number },
  company_name: { type: String, required: true },
  role: { type: String, required: true },
  job_type: { type: String, enum: ['Internship', 'Full-time', 'Part-time'], default: 'Full-time' },
  location: { type: String, default: '' },
  application_date: { type: String, required: true },
  job_url: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Interested', 'Applied', 'Assessment', 'Interview', 'Selected', 'Rejected', 'Withdrawn'], 
    default: 'Applied' 
  },
  follow_up_date: { type: String, default: '' },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

JobApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
