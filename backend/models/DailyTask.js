const mongoose = require('mongoose');

const DailyTaskSchema = new mongoose.Schema({
  sqlite_id: { type: Number },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

DailyTaskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('DailyTask', DailyTaskSchema);
