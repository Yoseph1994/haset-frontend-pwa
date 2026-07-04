import { apiClient, unwrap } from './client'
import type { PreferredLanguage, User, UserRole } from './types'

export interface RegisterPayload {
  name: string
  email: string
  phone_number: string
  password: string
  password_confirmation: string
  role: Extract<UserRole, 'employee' | 'hirer'>
  preferred_language?: PreferredLanguage
}

export interface AuthResult {
  user: User
  token: string
}

export function register(payload: RegisterPayload) {
  return unwrap<AuthResult>(apiClient.post('/auth/register', payload))
}

export function login(payload: { email: string; password: string }) {
  return unwrap<AuthResult>(apiClient.post('/auth/login', payload))
}

export function logout() {
  return unwrap<null>(apiClient.post('/auth/logout'))
}

export function me() {
  return unwrap<User>(apiClient.get('/auth/me'))
}

export function sendEmailVerificationOtp() {
  return unwrap<null>(apiClient.post('/auth/email/send-otp'))
}

export function verifyEmailOtp(code: string) {
  return unwrap<User>(apiClient.post('/auth/email/verify-otp', { code }))
}

export function forgotPassword(email: string) {
  return unwrap<null>(apiClient.post('/auth/password/forgot', { email }))
}

export function resetPassword(payload: {
  email: string
  code: string
  password: string
  password_confirmation: string
}) {
  return unwrap<AuthResult>(apiClient.post('/auth/password/reset', payload))
}

export function changePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}) {
  return unwrap<null>(apiClient.post('/auth/password/change', payload))
}
