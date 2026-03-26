const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  targetModel: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
