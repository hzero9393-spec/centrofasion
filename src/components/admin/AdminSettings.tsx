'use client';

import React from 'react';
import { useNavigation } from '@/stores/navigation';

export default function AdminSettings() {
  const { navigate } = useNavigation();

  // Settings redirects to profile
  React.useEffect(() => {
    navigate('admin-profile');
  }, [navigate]);

  return null;
}
