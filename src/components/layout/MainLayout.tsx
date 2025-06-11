import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNavigation } from '../ui/BottomNavigation';
import { PageTransition } from '../ui/PageTransition';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main className="pt-16 md:pt-20 pb-20 md:pb-0">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNavigation />
    </div>
  );
}