// Types for Self verification data
export interface VerificationData {
  name?: string;
  nationality?: string;
  gender?: string;
  dateOfBirth?: string;
  issuingState?: string;
  passportNumber?: string;
  expiryDate?: string;
  verificationTimestamp?: string;
  userId?: string;
}

export interface VerificationStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
  data?: VerificationData;
}

export interface SelfAppConfig {
  version: number;
  appName: string;
  scope: string;
  endpoint: string;
  logoBase64?: string;
  userId: string;
  endpointType: string;
  userIdType: string;
  userDefinedData?: string;
}
