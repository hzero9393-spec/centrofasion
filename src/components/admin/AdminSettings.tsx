'use client';

import React from 'react';
import { useAuth } from '@/stores/auth';
import { useAdminNavigation } from '@/stores/adminNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings } from 'lucide-react';

export default function AdminSettings() {
  const { logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = '/admin';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#1F2A3A]">Settings</h1>

      <Card className="border-[#E4E7EC]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F5F7FA] flex items-center justify-center">
              <Settings className="h-5 w-5 text-[#5A6B7F]" />
            </div>
            <div>
              <h3 className="font-medium text-[#1F2A3A]">Account Settings</h3>
              <p className="text-sm text-[#5A6B7F]">Manage your admin account</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[#1F2A3A]">Sign out of your admin account</p>
              <p className="text-xs text-[#5A6B7F]">You will need to sign in again to access the admin panel</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#DC3545] text-[#DC3545] hover:bg-[#FFEBEE] gap-2 w-fit"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
