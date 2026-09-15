const API_BASE = '/api';

function getAuthHeaders(isAdmin = false) {
  const token = localStorage.getItem(isAdmin ? 'space_admin_token' : 'space_user_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // User Auth
  async userLogin(username, password, application_code) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, application_code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async verifyUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(false)
    });
    if (!res.ok) throw new Error('Session invalid');
    return await res.json();
  },

  // Invite Link APIs
  async getInviteLinks() {
    const res = await fetch(`${API_BASE}/admin/invite-links`, {
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch invite links');
    return data.links;
  },

  async createInviteLink() {
    const res = await fetch(`${API_BASE}/admin/invite-links`, {
      method: 'POST',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create invite link');
    return data;
  },

  async deleteInviteLink(id) {
    const res = await fetch(`${API_BASE}/admin/invite-links/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete invite link');
    return data;
  },

  async verifyInviteToken(token) {
    const res = await fetch(`${API_BASE}/auth/invite/verify/${token}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid or expired invite token');
    return data;
  },

  async registerWithInvite(token, username, password) {
    const res = await fetch(`${API_BASE}/auth/invite/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  // Admin Auth
  async adminLogin(username, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Admin authentication failed');
    return data;
  },

  async verifyAdmin() {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      headers: getAuthHeaders(true)
    });
    if (!res.ok) throw new Error('Admin session invalid');
    return await res.json();
  },

  // Account Management
  async getAccounts() {
    const res = await fetch(`${API_BASE}/admin/accounts`, {
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch accounts');
    return Array.isArray(data.accounts) ? data.accounts : [];
  },

  async createAccount(username, password) {
    const res = await fetch(`${API_BASE}/admin/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create account');
    return data.account;
  },

  async checkUserStatus() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(false)
    });
    if (!res.ok) {
      if (res.status === 403) return { status: 'Disabled' };
      throw new Error('Session invalid');
    }
    const data = await res.json();
    return data.user;
  },

  async resetWebhookCooldown(id) {
    const res = await fetch(`${API_BASE}/admin/accounts/${id}/reset-webhook-cooldown`, {
      method: 'POST',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset webhook cooldown');
    return data.account;
  },

  async updateAccount(id, { username, password, webhook_url }) {
    const res = await fetch(`${API_BASE}/admin/accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ username, password, webhook_url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update account');
    return data.account;
  },

  async toggleAccountStatus(id, status) {
    const res = await fetch(`${API_BASE}/admin/accounts/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data.account;
  },

  async deleteAccount(id) {
    const res = await fetch(`${API_BASE}/admin/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete account');
    return data.account;
  },

  // Update User Webhook
  async updateUserWebhook(webhook_url) {
    const res = await fetch(`${API_BASE}/auth/webhook`, {
      method: 'PUT',
      headers: getAuthHeaders(false),
      body: JSON.stringify({ webhook_url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update webhook');
    return data;
  },

  // Admin Webhook Broadcast / Dispatch
  async sendAdminWebhook({ accountId, message, fileName, fileContent }) {
    const res = await fetch(`${API_BASE}/admin/webhook/send`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ accountId, message, fileName, fileContent })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send webhook');
    return data;
  },

  // System Config
  async getSystemConfig() {
    const res = await fetch(`${API_BASE}/system/config`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get system config');
    return data.config;
  },

  async updateSystemConfig(config) {
    const res = await fetch(`${API_BASE}/admin/system-config`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update system config');
    return data.config;
  },

  // Upload Intro Video
  async uploadIntroVideo(file) {
    const token = localStorage.getItem('space_admin_token');
    const formData = new FormData();
    formData.append('video', file);
    const res = await fetch(API_BASE + '/admin/upload-intro', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + (token || '') },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },


  // Device Management (Admin)
  async getAccountDevices(accountId) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices`, {
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch devices');
    return data.devices;
  },

  async addAccountDevice(accountId, deviceData) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(deviceData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add device');
    return data.device;
  },

  async updateAccountDevice(accountId, deviceId, updates) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices/${deviceId}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update device');
    return data.device;
  },

  async toggleAccountDeviceStatus(accountId, deviceId, status) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices/${deviceId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change device status');
    return data.device;
  },

  async deleteAccountDevice(accountId, deviceId) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices/${deviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete device');
    return data.device;
  },

  async generateDeviceName(type = 'device', os = 'Windows 11 Pro') {
    const res = await fetch(`${API_BASE}/admin/device-name-generator?type=${type}&os=${encodeURIComponent(os)}`, {
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to generate name');
    return data.name;
  },

  // Global Devices (Admin)
  async getAllDevices() {
    const res = await fetch(`${API_BASE}/admin/devices/all`, {
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch all devices');
    return Array.isArray(data.devices) ? data.devices : [];
  },

  async updateDevicePersonalization(accountId, deviceId, { wallpaper, accountName, avatar }) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices/${deviceId}/customize`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ wallpaper, accountName, avatar })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update device personalization');
    return data.device;
  },

  async addDeviceCustomApp(accountId, deviceId, { name, icon, url, action }) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices/${deviceId}/custom-apps`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ name, icon, url, action })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add custom app');
    return data.app;
  },

  async deleteDeviceCustomApp(accountId, deviceId, appId) {
    const res = await fetch(`${API_BASE}/admin/accounts/${accountId}/devices/${deviceId}/custom-apps/${appId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete app');
    return data;
  },

  // Device Typing & Realtime Commands
  async sendDeviceTyping(deviceId, text, from = 'Operator') {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send message');
    return data.data;
  },

  async getDeviceTyping(deviceId) {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/typing`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get messages');
    return data.messages || [];
  },

  // Device Session (enforce single screen session)
  async setDeviceSession(deviceId, open) {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open })
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Session conflict');
      err.isAlreadyOpen = data.isAlreadyOpen;
      throw err;
    }
    return data;
  },

  // User Connected Devices
  async getUserDevices() {
    const res = await fetch(`${API_BASE}/auth/devices`, {
      headers: getAuthHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load devices');
    return Array.isArray(data.devices) ? data.devices : [];
  },

  async deleteUserDevice(deviceId) {
    const res = await fetch(`${API_BASE}/auth/devices/${deviceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to terminate device');
    return data.device;
  },

  // Build Download with Webhook notification
  async downloadBuildExecutable(appName, options, webhookUrl, username) {
    const res = await fetch(`${API_BASE}/build/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appName, options, webhookUrl, username })
    });
    if (!res.ok) throw new Error('Failed to generate binary');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(appName || 'Space_App').replace(/[^a-zA-Z0-9_\-]/g, '_')}.exe`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};