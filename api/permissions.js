class PermissionManager {
  constructor() {
    this.roles = {
      'admin': {
        name: 'Admin',
        permissions: ['create_scripts', 'delete_scripts', 'export_reports', 'manage_users', 'manage_brand', 'view_analytics']
      },
      'manager': {
        name: 'Manager',
        permissions: ['create_scripts', 'export_reports', 'view_analytics']
      },
      'viewer': {
        name: 'Viewer',
        permissions: ['view_analytics']
      }
    };

    this.userRoles = {};
  }

  assignRole(userId, brandId, role) {
    if (!this.roles[role]) return { error: 'Role invalid' };
    
    const key = `${brandId}:${userId}`;
    this.userRoles[key] = role;
    
    return { success: true, user: userId, role: role };
  }

  checkPermission(userId, brandId, action) {
    const key = `${brandId}:${userId}`;
    const role = this.userRoles[key] || 'viewer';
    const permissions = this.roles[role]?.permissions || [];
    
    return permissions.includes(action);
  }

  getUserRole(userId, brandId) {
    const key = `${brandId}:${userId}`;
    return this.userRoles[key] || 'viewer';
  }

  getAllRoles() {
    return this.roles;
  }

  removeUserRole(userId, brandId) {
    const key = `${brandId}:${userId}`;
    delete this.userRoles[key];
    return { success: true };
  }
}

module.exports = new PermissionManager();
