import api from './api';

export const auditService = {
  getAuditLogs: (page = 0, size = 20) =>
    api.get('/audit-logs', { params: { page, size } }),
};
