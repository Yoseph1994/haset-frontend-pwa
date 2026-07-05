// Shared types mirroring the Laravel API Resources in backend/app/Http/Resources.

export type UserRole = 'employee' | 'hirer' | 'admin' | 'verifier'
export type PreferredLanguage = 'am' | 'en' | 'om'
export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'
export type EmploymentType = 'gig' | 'permanent' | 'both'

export interface User {
  id: string
  name: string
  email: string
  phone_number: string
  profile_photo_url: string | null
  preferred_language: PreferredLanguage
  role: UserRole
  account_status: string
  email_verified_at: string | null
  phone_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface ExperienceEntry {
  employer: string
  role: string
  from: string
  to?: string | null
  description?: string | null
}

export interface EmployeeProfile {
  id: string
  user_id: string
  user?: User
  job_category: string
  employment_type: EmploymentType
  availability_status: 'available' | 'assigned' | 'on_leave' | 'inactive'
  skills: string[]
  languages_spoken: string[]
  years_experience: number | null
  bio: string | null
  experience_history: ExperienceEntry[] | null
  city: string
  sub_city: string | null
  expected_salary_min: string | null
  expected_salary_max: string | null
  salary_currency: string | null
  verification_status: VerificationStatus
  verified_at: string | null
  rejection_reason: string | null
  is_visible: boolean
  average_rating: string | null
  total_assignments: number | null
  created_at: string
  updated_at: string
}

export interface HirerProfile {
  id: string
  user_id: string
  user?: User
  hirer_type: 'individual' | 'company'
  company_name: string | null
  company_tin: string | null
  description: string | null
  purpose_of_hire: string
  city: string
  sub_city: string | null
  address_detail: string | null
  alternate_phone: string | null
  verification_status: VerificationStatus
  verified_at: string | null
  rejection_reason: string | null
  average_rating: string | null
  total_hires: number | null
  payment_reliability: string | null
  is_blacklisted: boolean
  created_at: string
  updated_at: string
}

export type DocumentType =
  | 'national_id'
  | 'passport'
  | 'work_permit'
  | 'certificate'
  | 'reference_letter'
  | 'company_reg'
  | 'tin_certificate'
  | 'other'

export interface AppDocument {
  id: string
  user_id: string
  document_type: DocumentType
  file_url: string | null
  file_name: string
  mime_type: string
  file_size_bytes: number
  notes: string | null
  status: VerificationStatus
  verified_at: string | null
  rejection_reason: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
}

export type JobStatus = 'draft' | 'open' | 'closed' | 'filled' | 'expired'

export interface JobPosting {
  id: string
  hirer_id: string
  hirer?: User
  title: string
  description: string
  job_category: string
  required_skills: string[] | null
  employment_type: EmploymentType
  salary_min: string | null
  salary_max: string | null
  salary_currency: string | null
  duration_days: number | null
  positions_needed: number | null
  positions_filled: number | null
  positions_remaining: number | null
  city: string
  sub_city: string | null
  is_remote: boolean
  status: JobStatus
  expires_at: string | null
  total_applicants: number | null
  created_at: string
  updated_at: string
}

export type HiringRequestType = 'application' | 'invitation'
export type HiringRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired'

export interface HiringRequest {
  id: string
  hirer_id: string
  employee_id: string
  job_id: string | null
  hirer?: User
  employee?: User
  job?: JobPosting
  type: HiringRequestType
  message: string | null
  proposed_salary: string | null
  status: HiringRequestStatus
  rejected_reason: string | null
  expires_at: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'

export interface Offer {
  id: string
  hiring_request_id: string
  hirer_id: string
  employee_id: string
  job_id: string | null
  hirer?: User
  employee?: User
  job?: JobPosting
  /** Draft contract created when the offer was accepted (for review/agree/pay). */
  contract_id?: string | null
  agreed_salary: string
  salary_currency: string
  platform_fee_pct: string
  platform_fee_amount: string
  employment_type: EmploymentType
  proposed_start_date: string | null
  terms_notes: string | null
  status: OfferStatus
  expires_at: string | null
  accepted_at: string | null
  rejected_reason: string | null
  created_at: string
  updated_at: string
}

export type ContractStatus = 'awaiting_payment' | 'active' | 'completed' | 'terminated' | 'cancelled'

export interface Contract {
  id: string
  reference: string | null
  hirer_id: string
  employee_id: string
  job_id: string | null
  offer_id: string
  payment_id: string | null
  hirer?: User
  employee?: User
  job?: JobPosting
  agreed_salary: string
  salary_currency: string
  platform_fee_pct: string
  platform_fee_amount: string
  employment_type: EmploymentType
  start_date: string | null
  end_date: string | null
  actual_end_date: string | null
  terms_summary: string | null
  status: ContractStatus
  employee_agreed_at: string | null
  hirer_agreed_at: string | null
  both_agreed: boolean
  has_pdf: boolean
  termination_reason: string | null
  terminated_at: string | null
  created_at: string
  updated_at: string
}

/** Structured, human-readable contract terms for the on-screen review + PDF. */
export interface ContractTerms {
  reference: string | null
  parties: {
    hirer: { name: string | null; company: string | null; email: string | null }
    employee: { name: string | null; email: string | null }
  }
  job: { title: string; description: string | null; employment_type: string }
  dates: { start: string | null; end: string | null }
  compensation: {
    agreed_salary: number
    currency: string
    platform_fee_pct: number
    platform_fee_amount: number
    breakdown: string
  }
  hirer_responsibilities: string[]
  employee_responsibilities: string[]
  termination: string
  dispute_resolution: string
  platform_liability: string
  agreement: {
    employee_agreed_at: string | null
    hirer_agreed_at: string | null
    both_agreed: boolean
  }
}

export interface ContractEvent {
  id: string
  contract_id: string
  actor_id: string
  actor?: User
  event_type: string
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Rating {
  id: string
  contract_id: string
  reviewer_id: string
  reviewed_user_id: string
  reviewer?: User
  reviewed_user?: User
  rating: string
  comment: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  offer_id: string
  contract_id: string | null
  payer_id: string
  amount: string
  currency: string
  type: string
  status: PaymentStatus
  chapa_tx_ref: string
  chapa_checkout_url: string | null
  /** When true, show the in-app mock Chapa popup instead of redirecting to real checkout. */
  mock: boolean
  paid_at: string | null
  failed_reason: string | null
  created_at: string
  updated_at: string
}

export interface AppNotification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}
