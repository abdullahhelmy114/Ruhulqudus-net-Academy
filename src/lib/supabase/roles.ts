import { createClient } from './client';

export async function getUserRole() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  return data?.role;
}

export async function isAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}

export async function isTeacher() {
  const role = await getUserRole();
  return role === 'teacher';
}