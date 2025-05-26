import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Placeholder: always redirect to login
  redirect('/admin/login');
  return null;
} 