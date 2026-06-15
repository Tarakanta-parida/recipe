'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Recipe } from '@/lib/db';
import { Utensils, CheckCircle2, Clock, Check, Edit, Trash, Lock, ShieldAlert, Loader2 } from 'lucide-react';
import PasswordGate from '@/components/PasswordGate';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminMode, adminPassword, changeAdminPassword, showToast } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== adminPassword) {
      setPasswordError('Current password is incorrect.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    
    changeAdminPassword(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  // Fetch all recipes for management
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recipes?status=all');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      } else {
        showToast('Failed to load recipe archives.', 'error');
      }
    } catch (err) {
      console.error('Fetch admin recipes error:', err);
      showToast('Connection error loading archives.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminMode) {
      fetchRecipes();
    }
  }, [adminMode, showToast]);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (res.ok) {
        showToast(`Approved "${name}"!`);
        fetchRecipes(); // Refresh list
      } else {
        showToast('Failed to approve recipe.', 'error');
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast('Error connecting to API.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const res = await fetch(`/api/recipes/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          showToast(`Deleted "${name}".`, 'info');
          fetchRecipes(); // Refresh list
        } else {
          showToast('Failed to delete recipe.', 'error');
        }
      } catch (err) {
        console.error('Delete error:', err);
        showToast('Error connecting to API.', 'error');
      }
    }
  };

  // Removed direct redirect since PasswordGate handles security
  // Calculate statistics
  const total = recipes.length;
  const approved = recipes.filter((r) => r.status === 'approved').length;
  const pending = recipes.filter((r) => r.status === 'pending').length;

  return (
    <PasswordGate
      title="Kitchen Administration"
      description="Please enter the administrator password to manage recipe approvals, edits, and deletions."
    >
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-10 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-bold">Kitchen Administration</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Review user submissions, edit existing items, and curate recipe approvals.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Utensils className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Recipes</div>
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
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Approval</div>
              <div className="text-3xl font-extrabold text-foreground mt-1">{pending}</div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground text-sm font-medium">Fetching recipe entries...</p>
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
                            {!isApproved && (
                              <button
                                onClick={() => handleApprove(r.id, r.name)}
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
                            <button
                              onClick={() => handleDelete(r.id, r.name)}
                              className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg cursor-pointer text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Trash className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16 text-muted-foreground font-semibold">
                No recipes found in the archive.
              </div>
            )}
          </div>
      </div>

      {/* Settings Section */}
      <section className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm max-w-xl mt-6">
        <div className="flex flex-col gap-1.5 mb-6">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Admin Security Settings
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            Change the password used to protect Admin Mode, the Dashboard, and Recipe submissions.
          </p>
        </div>

        <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {passwordError && (
              <div className="flex flex-col gap-1.5 col-span-1 md:col-span-3">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3 rounded-xl">
                  {passwordError}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">Current Password</label>
              <input
                type="password"
                required
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">New Password</label>
              <input
                type="password"
                required
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
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="self-start bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-2 rounded-xl cursor-pointer text-xs transition-all shadow-sm active:scale-[0.98] mt-2"
          >
            Update Password
          </button>
        </form>
      </section>
    </div>
  </PasswordGate>
  );
}
