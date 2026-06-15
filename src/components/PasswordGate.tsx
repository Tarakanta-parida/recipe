'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function PasswordGate({ children, title, description }: PasswordGateProps) {
  return <>{children}</>;
}
