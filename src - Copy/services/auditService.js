const AuditLog = require('../models/AuditLog');

exports.log = async ({ actor, action, targetModel, targetId, metadata = {} }) => {
  await AuditLog.create({ actor, action, targetModel, targetId, metadata });
};
