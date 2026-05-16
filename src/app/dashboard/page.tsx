'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  doc, getDoc, updateDoc, arrayUnion, collection,
  getDocs, deleteDoc, query, where, addDoc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../components/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mic2, Upload, LogOut, User, Music, Plus, Eye, Users, FileText,
  Bell, CheckCircle, Check, X, Trash2, Edit3, Save, Star,
  MessageSquare, Mic, Package, Sparkles, Camera, BarChart3, Heart,
  TrendingUp, Building2, UserCheck, Phone, Mail, Briefcase, Tag,
  Send, Download, Settings
} from 'lucide-react';

import AdminSettingsTab from '../components/AdminSettingsTab';
import AdminServicesTab from '../components/AdminServicesTab';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:     { label: 'في الانتظار',     color: 'bg-amber-100 text-amber-700' },
  accepted:    { label: 'تم القبول',        color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'جاري التنفيذ',    color: 'bg-violet-100 text-violet-700' },
  review:      { label: 'بحاجة للمراجعة', color: 'bg-orange-100 text-orange-700' },
  completed:   { label: 'مكتمل',           color: 'bg-emerald-100 text-emerald-700' },
};

const statusOptions = [
  { value: 'pending',     label: 'في الانتظار' },
  { value: 'accepted',    label: 'تم القبول' },
  { value: 'in_progress', label: 'جاري التنفيذ' },
  { value: 'review',      label: 'بحاجة للمراجعة' },
  { value: 'completed',   label: 'مكتمل' },
];

type TabType = 'overview' | 'audio' | 'profile' | 'reviews' | 'notifications' | 'artists' | 'orders' | 'stats' | 'partners' | 'clients' | 'packages' | 'settings' | 'services-mgmt';