import React, { Suspense } from 'react';
import SearchContent from './SearchContent';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading Search view...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
