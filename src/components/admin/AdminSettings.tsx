'use client';

import React from 'react';
import { useAuth } from '@/stores/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings, ChevronRight, Shield, Monitor, Bell, Globe } from 'lucide-react';

export default function AdminSettings() {
  const { logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = '/admin';
  };

  const settingItems = [
    {
      icon: <Monitor className="h-4 w-4" />,
      title: 'Display Preferences',
      description: 'Adjust display density and layout options',
      disabled: true,
    },
    {
      icon: <Bell className="h-4 w-4" />,
      title: 'Notifications',
      description: 'Configure order and stock alerts',
      disabled: true,
    },
    {
      icon: <Globe className="h-4 w-4" />,
      title: 'Regional Settings',
      description: 'Currency, timezone, and language',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F5F5F7] tracking-tight">Settings</h1>
        <p className="text-sm text-[#86868B] mt-1">Manage your account and application preferences</p>
      </div>

      {/* General Settings */}
      <Card className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Settings className="h-5 w-5 text-[#86868B]" />
            </div>
            <div>
              <h3 className="font-medium text-[#F5F5F7]">General Settings</h3>
              <p className="text-xs text-[#86868B] mt-0.5">Application preferences and configuration</p>
            </div>
          </div>

          <Separator className="bg-white/[0.05]" />

          <div className="divide-y divide-white/[0.05]">
            {settingItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-6 py-4 transition-colors ${
                  item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.03] cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#86868B]">{item.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F7]">{item.title}</p>
                    <p className="text-xs text-[#86868B] mt-0.5">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-[#1D1D1F] border border-white/[0.08] rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-medium text-[#F5F5F7]">Account Settings</h3>
              <p className="text-xs text-[#86868B] mt-0.5">Manage your admin account session</p>
            </div>
          </div>

          <Separator className="bg-white/[0.05]" />

          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[#F5F5F7]">Sign out of your admin account</p>
              <p className="text-xs text-[#86868B] mt-0.5">You will need to sign in again to access the admin panel</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 gap-2 w-fit transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
