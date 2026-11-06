'use client'; // Marks this as a Client Component

import { useEffect } from 'react';
import { seedDatabase } from '@/lib/db'; // Path to your Dexie setup

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function initializeApp() {
      try {
        await seedDatabase();
        console.log('Client-side database check complete.');
      } catch (error) {
        console.error('Failed to seed database:', error);
      }
    }

    initializeApp();
  }, []); // Empty dependency array ensures this runs strictly once when the app loads in the browser

  return <>{children}</>;
}