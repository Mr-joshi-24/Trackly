const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  daily_task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyTask', required: true },
  log_date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
});

// Ensure compound uniqueness for task & log date
DailyLogSchema.index({ daily_task_id: 1, log_date: 1 }, { unique: true });

DailyLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
