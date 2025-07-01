import { getSupabaseClient } from "@/models/db";
import bcryptjs from "bcryptjs";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 10;

export interface UserCredential {
  id: number;
  user_uuid: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailVerificationToken {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hashSync(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compareSync(password, hash);
}

// Generate random token
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Get user by email
export async function getUserByEmail(email: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_credentials')
    .select('*')
    .eq('email', email)
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
  
  return data;
}

// Create user credentials
export async function createUserCredentials(
  userUuid: string,
  email: string,
  password: string
) {
  const supabase = getSupabaseClient();
  const passwordHash = await hashPassword(password);
  
  const { data, error } = await supabase
    .from('user_credentials')
    .insert({
      user_uuid: userUuid,
      email,
      password_hash: passwordHash,
      email_verified: false
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user credentials:', error);
    throw error;
  }
  
  return data;
}

// Create email verification token
export async function createEmailVerificationToken(email: string) {
  const supabase = getSupabaseClient();
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
  
  const { data, error } = await supabase
    .from('email_verification_tokens')
    .insert({
      email,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating verification token:', error);
    throw error;
  }
  
  return data;
}

// Verify email token
export async function verifyEmailToken(token: string) {
  const supabase = getSupabaseClient();
  
  // Get token
  const { data: tokenData, error: tokenError } = await supabase
    .from('email_verification_tokens')
    .select('*')
    .eq('token', token)
    .single();
    
  if (tokenError || !tokenData) {
    return { success: false, error: 'Invalid token' };
  }
  
  // Check if expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { success: false, error: 'Token expired' };
  }
  
  // Update user email verified status
  const { error: updateError } = await supabase
    .from('user_credentials')
    .update({ email_verified: true })
    .eq('email', tokenData.email);
    
  if (updateError) {
    return { success: false, error: 'Failed to verify email' };
  }
  
  // Delete used token
  await supabase
    .from('email_verification_tokens')
    .delete()
    .eq('token', token);
    
  return { success: true, email: tokenData.email };
}

// Create password reset token
export async function createPasswordResetToken(email: string) {
  const supabase = getSupabaseClient();
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour
  
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .insert({
      email,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating reset token:', error);
    throw error;
  }
  
  return data;
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
  const supabase = getSupabaseClient();
  
  // Get token
  const { data: tokenData, error: tokenError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .single();
    
  if (tokenError || !tokenData) {
    return { success: false, error: 'Invalid token' };
  }
  
  // Check if expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return { success: false, error: 'Token expired' };
  }
  
  // Update password
  const passwordHash = await hashPassword(newPassword);
  const { error: updateError } = await supabase
    .from('user_credentials')
    .update({ password_hash: passwordHash })
    .eq('email', tokenData.email);
    
  if (updateError) {
    return { success: false, error: 'Failed to reset password' };
  }
  
  // Delete used token
  await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('token', token);
    
  return { success: true };
}