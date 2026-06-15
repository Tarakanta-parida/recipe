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
  const { adminMode, showToast } = useApp();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

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
      </div>
    </PasswordGate>
  );
}
