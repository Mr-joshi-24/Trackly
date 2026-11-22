const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  sqlite_id: { type: Number },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  due_date: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  category: { type: String, default: 'General' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

TaskSchema.virtual('dueDate')
  .get(function() {
    return this.due_date;
  })
  .set(function(val) {
    this.due_date = val;
  });

TaskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.dueDate = ret.due_date;
    delete ret.__v;
    return ret;
  }
});

TaskSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.dueDate = ret.due_date;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Task', TaskSchema);
