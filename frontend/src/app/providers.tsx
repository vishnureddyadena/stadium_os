"use client";

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { NavigationVoiceProvider } from '@/context/NavigationVoiceContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <NavigationVoiceProvider>
          {children}
        </NavigationVoiceProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

