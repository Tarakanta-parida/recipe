import React, { Suspense } from 'react';
import AddRecipeFormContent from './AddRecipeFormContent';
import { Loader2 } from 'lucide-react';
import PasswordGate from '@/components/PasswordGate';

export default function AddRecipePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading recipe form...</p>
        </div>
      }
    >
      <PasswordGate
        title="Share Your Recipe"
        description="Please enter the password to submit a new recipe to Kavi's Kitchen."
      >
        <AddRecipeFormContent />
      </PasswordGate>
    </Suspense>
  );
}
