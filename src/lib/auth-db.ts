import { supabaseClient } from './db';
import bcrypt from 'bcryptjs';

const BACKEND_SECRET = process.env.BACKEND_SECRET || 'kavis_kitchen_secret_2026';
const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'super_author' | 'contributor';
  created_at: string;
}

export interface PasswordRequest {
  id: string;
  requester_id: string;
  requester_name?: string;
  requester_email?: string;
  approver_id: string | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  request_token: string;
  expires_at: string;
  approved_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  user_email?: string;
  action: string;
  ip_address: string | null;
  timestamp: string;
}

// In-memory tables for mock fallback
declare global {
  var _dbUsers: User[] | undefined;
  var _dbPasswordRequests: PasswordRequest[] | undefined;
  var _dbAuditLogs: AuditLog[] | undefined;
}

// Helper to generate UUIDs locally (for mock DB)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Seed mock database if not already populated
if (!globalThis._dbUsers) {
  // Pre-seed the super authors with temporary password 'SuperAdmin@2026!'
  // bcrypt hash of 'SuperAdmin@2026!'
  const seedHash = bcrypt.hashSync('SuperAdmin@2026!', 12);
  
  globalThis._dbUsers = [
    {
      id: 'a1111111-1111-4111-a111-111111111111',
      name: 'Owner A (Primary)',
      email: 'rkparida09@gmail.com',
      password_hash: seedHash,
      role: 'super_author',
      created_at: new Date().toISOString()
    },
    {
      id: 'a2222222-2222-4222-a222-222222222222',
      name: 'Owner B (Secondary)',
      email: 'paridatarakanta2020@gmail.com',
      password_hash: seedHash,
      role: 'super_author',
      created_at: new Date().toISOString()
    }
  ];
  globalThis._dbPasswordRequests = [];
  globalThis._dbAuditLogs = [];
}

export const authDb = {
  async getUserByEmail(email: string): Promise<User | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_get_user_by_email', {
        secret_token: BACKEND_SECRET,
        p_email: email
      });
      if (error) {
        console.error('RPC auth_get_user_by_email error:', error);
        return null;
      }
      return data as User | null;
    } else {
      const users = globalThis._dbUsers || [];
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  async getUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_get_user_by_id', {
        secret_token: BACKEND_SECRET,
        p_id: id
      });
      if (error) {
        console.error('RPC auth_get_user_by_id error:', error);
        return null;
      }
      return data as Omit<User, 'password_hash'> | null;
    } else {
      const users = globalThis._dbUsers || [];
      const user = users.find(u => u.id === id);
      if (!user) return null;
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  },

  async createUser(name: string, email: string, passwordHash: string, role: 'super_author' | 'contributor'): Promise<Omit<User, 'password_hash'>> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_create_user', {
        secret_token: BACKEND_SECRET,
        p_name: name,
        p_email: email,
        p_password_hash: passwordHash,
        p_role: role
      });
      if (error) {
        throw new Error(error.message);
      }
      return data as Omit<User, 'password_hash'>;
    } else {
      const users = globalThis._dbUsers || [];
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email is already registered');
      }

      let finalRole = role;
      if (['rkparida09@gmail.com', 'paridatarakanta2020@gmail.com'].includes(email.toLowerCase())) {
        finalRole = 'super_author';
      }

      const newUser: User = {
        id: generateUUID(),
        name,
        email,
        password_hash: passwordHash,
        role: finalRole as 'super_author' | 'contributor',
        created_at: new Date().toISOString()
      };

      globalThis._dbUsers = [...users, newUser];
      const { password_hash, ...safeUser } = newUser;
      return safeUser;
    }
  },

  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_update_user_password', {
        secret_token: BACKEND_SECRET,
        p_user_id: userId,
        p_password_hash: passwordHash
      });
      if (error) {
        console.error('RPC auth_update_user_password error:', error);
        return false;
      }
      return data as boolean;
    } else {
      const users = globalThis._dbUsers || [];
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return false;
      users[idx].password_hash = passwordHash;
      globalThis._dbUsers = users;
      return true;
    }
  },

  async createPasswordRequest(requesterId: string, reason: string, token: string, expiresAt: Date): Promise<PasswordRequest> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_create_password_request', {
        secret_token: BACKEND_SECRET,
        p_requester_id: requesterId,
        p_reason: reason,
        p_token: token,
        p_expires_at: expiresAt.toISOString()
      });
      if (error) {
        throw new Error(error.message);
      }
      return data as PasswordRequest;
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      const users = globalThis._dbUsers || [];
      const requester = users.find(u => u.id === requesterId);

      const newRequest: PasswordRequest = {
        id: generateUUID(),
        requester_id: requesterId,
        requester_name: requester?.name,
        requester_email: requester?.email,
        approver_id: null,
        reason,
        status: 'pending',
        request_token: token,
        expires_at: expiresAt.toISOString(),
        approved_at: null,
        created_at: new Date().toISOString()
      };

      globalThis._dbPasswordRequests = [newRequest, ...requests];
      return newRequest;
    }
  },

  async getPasswordRequestByToken(token: string): Promise<PasswordRequest | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_get_password_request_by_token', {
        secret_token: BACKEND_SECRET,
        p_token: token
      });
      if (error) {
        console.error('RPC auth_get_password_request_by_token error:', error);
        return null;
      }
      return data as PasswordRequest | null;
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      const req = requests.find(r => r.request_token === token);
      if (!req) return null;

      // Update statuses to expired if expired
      if (req.status === 'pending' && new Date(req.expires_at).getTime() < Date.now()) {
        req.status = 'expired';
      }
      return req;
    }
  },

  async getPasswordRequestById(id: string): Promise<PasswordRequest | null> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_get_password_request_by_id', {
        secret_token: BACKEND_SECRET,
        p_id: id
      });
      if (error) {
        console.error('RPC auth_get_password_request_by_id error:', error);
        return null;
      }
      return data as PasswordRequest | null;
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      const req = requests.find(r => r.id === id);
      return req || null;
    }
  },

  async getPendingPasswordRequests(): Promise<PasswordRequest[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_get_pending_password_requests', {
        secret_token: BACKEND_SECRET
      });
      if (error) {
        console.error('RPC auth_get_pending_password_requests error:', error);
        return [];
      }
      return (data || []) as PasswordRequest[];
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      
      // Update statuses
      requests.forEach(r => {
        if (r.status === 'pending' && new Date(r.expires_at).getTime() < Date.now()) {
          r.status = 'expired';
        }
      });
      
      return requests;
    }
  },

  async approvePasswordRequest(requestId: string, approverId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_approve_password_request', {
        secret_token: BACKEND_SECRET,
        p_request_id: requestId,
        p_approver_id: approverId
      });
      if (error) {
        console.error('RPC auth_approve_password_request error:', error);
        return false;
      }
      return data as boolean;
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx === -1 || requests[idx].status !== 'pending') return false;
      
      requests[idx].status = 'approved';
      requests[idx].approver_id = approverId;
      requests[idx].approved_at = new Date().toISOString();
      requests[idx].expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      globalThis._dbPasswordRequests = requests;
      return true;
    }
  },

  async rejectPasswordRequest(requestId: string, approverId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_reject_password_request', {
        secret_token: BACKEND_SECRET,
        p_request_id: requestId,
        p_approver_id: approverId
      });
      if (error) {
        console.error('RPC auth_reject_password_request error:', error);
        return false;
      }
      return data as boolean;
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx === -1 || requests[idx].status !== 'pending') return false;

      requests[idx].status = 'rejected';
      requests[idx].approver_id = approverId;
      requests[idx].approved_at = new Date().toISOString();
      globalThis._dbPasswordRequests = requests;
      return true;
    }
  },

  async consumePasswordRequest(requestId: string): Promise<void> {
    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient.rpc('auth_consume_password_request', {
        secret_token: BACKEND_SECRET,
        p_request_id: requestId
      });
      if (error) {
        console.error('RPC auth_consume_password_request error:', error);
      }
    } else {
      const requests = globalThis._dbPasswordRequests || [];
      const idx = requests.findIndex(r => r.id === requestId);
      if (idx !== -1) {
        requests[idx].status = 'expired';
        globalThis._dbPasswordRequests = requests;
      }
    }
  },

  async createAuditLog(userId: string | null, action: string, ip: string | null): Promise<void> {
    if (isSupabaseConfigured && supabaseClient) {
      const { error } = await supabaseClient.rpc('auth_create_audit_log', {
        secret_token: BACKEND_SECRET,
        p_user_id: userId,
        p_action: action,
        p_ip: ip
      });
      if (error) {
        console.error('RPC auth_create_audit_log error:', error);
      }
    } else {
      const logs = globalThis._dbAuditLogs || [];
      const users = globalThis._dbUsers || [];
      const user = users.find(u => u.id === userId);

      const newLog: AuditLog = {
        id: generateUUID(),
        user_id: userId,
        user_name: user?.name,
        user_email: user?.email,
        action,
        ip_address: ip,
        timestamp: new Date().toISOString()
      };

      globalThis._dbAuditLogs = [newLog, ...logs];
    }
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient.rpc('auth_get_audit_logs', {
        secret_token: BACKEND_SECRET
      });
      if (error) {
        console.error('RPC auth_get_audit_logs error:', error);
        return [];
      }
      return (data || []) as AuditLog[];
    } else {
      return globalThis._dbAuditLogs || [];
    }
  }
};
