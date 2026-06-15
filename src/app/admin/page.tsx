'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Recipe } from '@/lib/db';
import { 
  Utensils, CheckCircle2, Clock, Check, Edit, Trash, Lock, 
  Loader2, Users, ClipboardList, ShieldAlert, KeyRound, Key, RefreshCw, XCircle
} from 'lucide-react';
import PasswordGate from '@/components/PasswordGate';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminMode, showToast, user, userRole, checkSession } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin and Contributor request list
  const [passwordRequests, setPasswordRequests] = useState<any[]>([]);
  const [fetchingRequests, setFetchingRequests] = useState(false);

  // Audit Logs (Super Authors only)
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  // Super Author direct OTP password change states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Contributor password request form states
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [contributorReason, setContributorReason] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  // Fetch all recipes or user's own recipes
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recipes?status=all');
      if (res.ok) {
        const data: Recipe[] = await res.json();
        if (userRole === 'super_author') {
          setRecipes(data);
        } else if (userRole === 'contributor' && user) {
          // Contributors only see/manage their own recipes
          // We filter by author name matching contributor name (case insensitive)
          const ownRecipes = data.filter(
            r => r.author.toLowerCase().trim() === user.name.toLowerCase().trim()
          );
          setRecipes(ownRecipes);
        }
      } else {
        showToast('Failed to load recipe archives.', 'error');
      }
    } catch (err) {
      console.error('Fetch recipes error:', err);
      showToast('Connection error loading archives.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch password change requests
  const fetchPasswordRequests = async () => {
    try {
      setFetchingRequests(true);
      const res = await fetch('/api/admin/password-requests');
      if (res.ok) {
        const data = await res.json();
        setPasswordRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setFetchingRequests(false);
    }
  };

  // Fetch audit logs (Super Authors only)
  const fetchAuditLogs = async () => {
    if (userRole !== 'super_author') return;
    try {
      setFetchingLogs(true);
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data || []);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => {
    if (adminMode) {
      fetchRecipes();
      fetchPasswordRequests();
      if (userRole === 'super_author') {
        fetchAuditLogs();
      }
    }
  }, [adminMode, userRole, showToast]);

  // Handle recipe approvals (Super Authors only)
  const handleApproveRecipe = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        showToast(`Approved "${name}"!`, 'success');
        fetchRecipes();
        fetchAuditLogs(); // Refresh logs if super author
      } else {
        showToast('Failed to approve recipe.', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast('Error connecting to API.', 'error');
    }
  };

  // Handle recipe deletions (Super Authors only)
  const handleDeleteRecipe = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const res = await fetch(`/api/recipes/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          showToast(`Deleted "${name}".`, 'info');
          fetchRecipes();
          fetchAuditLogs();
        } else {
          showToast('Failed to delete recipe.', 'error');
        }
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Error connecting to API.', 'error');
      }
    }
  };

  // Handle approving contributor password requests (Super Authors only)
  const handleApproveRequest = async (requestId: string, email: string) => {
    try {
      const res = await fetch('/api/auth/approve-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        showToast(`Approved request for ${email}! A secure reset link has been dispatched.`, 'success');
        fetchPasswordRequests();
        fetchAuditLogs();
      } else {
        showToast('Failed to approve request.', 'error');
      }
    } catch (err) {
      console.error('Approve request error:', err);
      showToast('Connection error.', 'error');
    }
  };

  // Handle rejecting contributor password requests (Super Authors only)
  const handleRejectRequest = async (requestId: string, email: string) => {
    try {
      const res = await fetch('/api/auth/reject-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        showToast(`Rejected request for ${email}.`, 'info');
        fetchPasswordRequests();
        fetchAuditLogs();
      } else {
        showToast('Failed to reject request.', 'error');
      }
    } catch (err) {
      console.error('Reject request error:', err);
      showToast('Connection error.', 'error');
    }
  };

  // Super Author direct OTP trigger
  const handleTriggerOTP = async () => {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/request-password-change', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        showToast(data.message, 'success');
      } else {
        setOtpError(data.error || 'Failed to trigger verification code');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Failed to connect to verification server');
    } finally {
      setOtpLoading(false);
    }
  };

  // Super Author direct password reset submission
  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setOtpError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError('Passwords do not match.');
      return;
    }
    
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: `OTP:${otpCode.trim()}`,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password updated successfully!', 'success');
        setOtpSent(false);
        setOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
        fetchAuditLogs();
      } else {
        setOtpError(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Connection error occurred.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Contributor password reset request submission
  const handleContributorRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqLoading(true);
    try {
      const res = await fetch('/api/auth/request-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contributorName.trim(),
          email: contributorEmail.trim(),
          reason: contributorReason.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        setContributorName('');
        setContributorEmail('');
        setContributorReason('');
        fetchPasswordRequests(); // Refresh requests list
      } else {
        showToast(data.error || 'Failed to submit request', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error.', 'error');
    } finally {
      setReqLoading(false);
    }
  };

  const total = recipes.length;
  const approved = recipes.filter((r) => r.status === 'approved').length;
  const pending = recipes.filter((r) => r.status === 'pending').length;

  return (
    <PasswordGate
      title="Kitchen Administration"
      description="Please sign in to access your recipe dashboard, approval forms, and security settings."
    >
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 animate-fade-in">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-4xl font-bold flex items-center gap-3">
              Kitchen Administration 
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {userRole === 'super_author' ? 'Super Author' : 'Contributor'}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>. Manage your recipes and profile security settings.
            </p>
          </div>

          <button 
            onClick={() => {
              fetchRecipes();
              fetchPasswordRequests();
              if (userRole === 'super_author') fetchAuditLogs();
            }}
            className="flex items-center justify-center gap-1.5 self-start md:self-center bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {userRole === 'super_author' ? 'Total Recipes' : 'My Recipes'}
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-1">{total}</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approved</div>
              <div className="text-3xl font-extrabold text-foreground mt-1">{approved}</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</div>
              <div className="text-3xl font-extrabold text-foreground mt-1">{pending}</div>
            </div>
          </div>
        </div>

        {/* Recipe Management Queue */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-border bg-secondary/10">
            <h2 className="font-display text-xl font-bold">
              {userRole === 'super_author' ? 'System Recipe Archive' : 'My Contributed Recipes'}
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              {userRole === 'super_author' 
                ? 'Approve user submissions or edit and delete active recipes.' 
                : 'View and edit recipes you have submitted to the platform.'}
            </p>
          </div>

          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground text-xs font-medium">Fetching recipe records...</p>
              </div>
            ) : recipes.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4">Recipe Details</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {recipes.map((r) => {
                    const isApproved = r.status === 'approved';
                    return (
                      <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={r.image}
                              alt={r.name}
                              className="w-12 h-12 object-cover rounded-lg border border-border shrink-0 bg-secondary"
                            />
                            <div className="flex flex-col gap-0.5">
                              <Link href={`/recipe/${r.id}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                                {r.name}
                              </Link>
                              <span className="text-xs text-muted-foreground font-medium">
                                {r.category} | {r.prepTime + r.cookTime} mins
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-muted-foreground">{r.author}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isApproved
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'
                          }`}>
                            {isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {userRole === 'super_author' && !isApproved && (
                              <button
                                onClick={() => handleApproveRecipe(r.id, r.name)}
                                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}
                            <Link
                              href={`/add-recipe?edit=${r.id}`}
                              className="bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </Link>
                            {userRole === 'super_author' && (
                              <button
                                onClick={() => handleDeleteRecipe(r.id, r.name)}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Trash className="w-3.5 h-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-muted-foreground font-semibold">
                No recipes found in your catalog.
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid Lower Half */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: PASSWORD REQUESTS & LOGS (SUPER AUTHOR) OR STATUS (CONTRIBUTOR) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* SUPER AUTHOR: PASS CHANGE REQUESTS QUEUE */}
            {userRole === 'super_author' && (
              <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5 w-full">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
                    <ClipboardList className="w-5 h-5 text-primary" /> Password Reset Request Queue
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Review and approve password change submissions from contributors. Once approved, the contributor will receive a reset link valid for 15 minutes.
                  </p>
                </div>

                {fetchingRequests ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : passwordRequests.length > 0 ? (
                  <div className="overflow-x-auto border border-border rounded-2xl">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border font-bold text-foreground">
                          <th className="px-4 py-3">Requester</th>
                          <th className="px-4 py-3">Reason</th>
                          <th className="px-4 py-3">Submitted</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {passwordRequests.map((req) => {
                          const isPending = req.status === 'pending';
                          return (
                            <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-bold">{req.requester_name}</div>
                                <div className="text-muted-foreground text-[10px]">{req.requester_email}</div>
                              </td>
                              <td className="px-4 py-3.5 max-w-[200px] truncate text-muted-foreground" title={req.reason}>
                                {req.reason}
                              </td>
                              <td className="px-4 py-3.5 text-muted-foreground">
                                {new Date(req.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  req.status === 'pending' && 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'
                                } ${
                                  req.status === 'approved' && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                } ${
                                  req.status === 'rejected' && 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                } ${
                                  req.status === 'expired' && 'bg-secondary border-border text-muted-foreground'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                {isPending ? (
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => handleApproveRequest(req.id, req.requester_email)}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-[10px]"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(req.id, req.requester_email)}
                                      className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-[10px]"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground font-semibold">Processed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-secondary/10 border border-dashed border-border rounded-2xl text-muted-foreground font-semibold">
                    No password reset requests submitted.
                  </div>
                )}
              </section>
            )}

            {/* SUPER AUTHOR: AUDIT LOGS LIST */}
            {userRole === 'super_author' && (
              <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5 w-full">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
                    <ShieldAlert className="w-5 h-5 text-primary" /> System Security Log
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Monitors account authentications, OTP generations, and administrative password updates.
                  </p>
                </div>

                {fetchingLogs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="overflow-x-auto border border-border rounded-2xl max-h-[300px] overflow-y-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="sticky top-0 bg-card z-10">
                        <tr className="bg-secondary border-b border-border font-bold text-foreground">
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Action Completed</th>
                          <th className="px-4 py-3">IP Address</th>
                          <th className="px-4 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3.5">
                              {log.user_email ? (
                                <div>
                                  <div className="font-semibold">{log.user_name}</div>
                                  <div className="text-[10px] text-muted-foreground">{log.user_email}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">Anonymous</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-medium text-foreground">{log.action}</td>
                            <td className="px-4 py-3.5 font-mono text-[10px] text-muted-foreground">{log.ip_address}</td>
                            <td className="px-4 py-3.5 text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-secondary/10 border border-dashed border-border rounded-2xl text-muted-foreground font-semibold">
                    No security events logged.
                  </div>
                )}
              </section>
            )}

            {/* CONTRIBUTOR: MY RESET REQUESTS STATUS LIST */}
            {userRole === 'contributor' && (
              <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5 w-full">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
                    <ClipboardList className="w-5 h-5 text-primary" /> My Password Change Requests
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Track the approval status of your password change requests. Approved links expire in 15 minutes.
                  </p>
                </div>

                {fetchingRequests ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : passwordRequests.length > 0 ? (
                  <div className="overflow-x-auto border border-border rounded-2xl">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-secondary/40 border-b border-border font-bold text-foreground">
                          <th className="px-4 py-3">Reason</th>
                          <th className="px-4 py-3">Requested At</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Expires At / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {passwordRequests.map((req) => {
                          const isApproved = req.status === 'approved';
                          const isExpired = new Date(req.expires_at).getTime() < Date.now();
                          return (
                            <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3.5 text-foreground font-medium">{req.reason}</td>
                              <td className="px-4 py-3.5 text-muted-foreground">
                                {new Date(req.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  req.status === 'pending' && 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500'
                                } ${
                                  isApproved && !isExpired && 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                } ${
                                  (req.status === 'rejected' || (isApproved && isExpired)) && 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                } ${
                                  req.status === 'expired' && 'bg-secondary border-border text-muted-foreground'
                                }`}>
                                  {isApproved && isExpired ? 'expired link' : req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                {isApproved && !isExpired ? (
                                  <Link
                                    href={`/admin?reset_token=${req.request_token}`}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-2.5 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer block text-center"
                                  >
                                    Reset Password Now
                                  </Link>
                                ) : (
                                  <span className="text-muted-foreground text-[10px]">
                                    {isApproved && isExpired ? 'Expired' : new Date(req.expires_at).toLocaleString()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-secondary/10 border border-dashed border-border rounded-2xl text-muted-foreground font-semibold">
                    No requests submitted yet.
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT SIDE: SECURITY & PASSWORD CHANGE PANEL */}
          <div className="lg:col-span-4 w-full">
            
            {/* SUPER AUTHOR: DIRECT OTP CHANGE PASSWORD */}
            {userRole === 'super_author' && (
              <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5 w-full">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
                    <KeyRound className="w-5 h-5 text-primary" /> System Password Manager
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    As a Super Author, you can update your credentials. A verification code (OTP) will be dispatched to your email.
                  </p>
                </div>

                {otpError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3.5 rounded-xl">
                    {otpError}
                  </div>
                )}

                {!otpSent ? (
                  <button
                    onClick={handleTriggerOTP}
                    disabled={otpLoading}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-3 rounded-xl cursor-pointer text-xs transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Requesting Code...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" /> Change Password
                      </>
                    )}
                  </button>
                ) : (
                  <form onSubmit={handleDirectPasswordChange} className="flex flex-col gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3 rounded-xl">
                      Verification code has been printed to the server console for local testing.
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">6-Digit OTP Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter OTP Code"
                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">New Secure Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Min 8 chars, 1 uppercase, 1 special"
                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Confirm Password"
                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 rounded-xl cursor-pointer text-xs transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                      >
                        {otpLoading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="bg-secondary border border-border text-foreground hover:bg-secondary/80 font-semibold px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {/* CONTRIBUTOR: SUBMIT RESET PASSWORD REQUEST FORM */}
            {userRole === 'contributor' && (
              <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5 w-full">
                <div className="flex flex-col gap-1.5">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
                    <KeyRound className="w-5 h-5 text-primary" /> Request Password Change
                  </h2>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    Enter your name and the justification for this request. Super Authors will review your request in their management panel.
                  </p>
                </div>

                <form onSubmit={handleContributorRequestSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      value={contributorName}
                      onChange={(e) => setContributorName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Your Registered Email</label>
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                      value={contributorEmail}
                      onChange={(e) => setContributorEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Reason for Request</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Lost old password / security rotation request"
                      className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
                      value={contributorReason}
                      onChange={(e) => setContributorReason(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reqLoading}
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl cursor-pointer text-xs transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 mt-1"
                  >
                    {reqLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </section>
            )}

          </div>

        </div>

      </div>
    </PasswordGate>
  );
}
