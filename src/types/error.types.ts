// Error Types
// Day 4 - Medium Priority Task: Type Safety Improvements
// Centralized error type definitions

// Base Error Types
export interface BaseError {
  code: string
  message: string
  timestamp: string
  requestId?: string
}

export interface ValidationError extends BaseError {
  field: string
  value?: any
  constraints: string[]
}

export interface DatabaseError extends BaseError {
  table?: string
  operation?: 'select' | 'insert' | 'update' | 'delete'
  constraint?: string
}

export interface AuthenticationError extends BaseError {
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'user_not_found' | 'email_not_confirmed'
}

export interface AuthorizationError extends BaseError {
  resource: string
  action: string
  userId?: string
}

export interface NetworkError extends BaseError {
  status?: number
  statusText?: string
  url?: string
}

// Specific Error Codes
export enum ErrorCodes {
  // Authentication Errors (1000-1099)
  INVALID_CREDENTIALS = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  TOKEN_INVALID = 'AUTH_1003',
  USER_NOT_FOUND = 'AUTH_1004',
  EMAIL_NOT_CONFIRMED = 'AUTH_1005',
  PASSWORD_TOO_WEAK = 'AUTH_1006',
  EMAIL_ALREADY_EXISTS = 'AUTH_1007',
  SIGNUP_DISABLED = 'AUTH_1008',
  
  // Authorization Errors (1100-1199)
  INSUFFICIENT_PERMISSIONS = 'AUTHZ_1101',
  RESOURCE_ACCESS_DENIED = 'AUTHZ_1102',
  ADMIN_REQUIRED = 'AUTHZ_1103',
  
  // Validation Errors (1200-1299)
  REQUIRED_FIELD_MISSING = 'VAL_1201',
  INVALID_EMAIL_FORMAT = 'VAL_1202',
  INVALID_URL_FORMAT = 'VAL_1203',
  VALUE_TOO_SHORT = 'VAL_1204',
  VALUE_TOO_LONG = 'VAL_1205',
  INVALID_NUMBER_RANGE = 'VAL_1206',
  INVALID_DATE_FORMAT = 'VAL_1207',
  INVALID_ENUM_VALUE = 'VAL_1208',
  
  // Database Errors (1300-1399)
  RECORD_NOT_FOUND = 'DB_1301',
  DUPLICATE_RECORD = 'DB_1302',
  FOREIGN_KEY_CONSTRAINT = 'DB_1303',
  UNIQUE_CONSTRAINT = 'DB_1304',
  CHECK_CONSTRAINT = 'DB_1305',
  CONNECTION_FAILED = 'DB_1306',
  TRANSACTION_FAILED = 'DB_1307',
  
  // Business Logic Errors (1400-1499)
  INSUFFICIENT_BALANCE = 'BIZ_1401',
  STAKE_ALREADY_EXISTS = 'BIZ_1402',
  STAKE_NOT_MATURE = 'BIZ_1403',
  PROTOCOL_INACTIVE = 'BIZ_1404',
  REWARD_ALREADY_CLAIMED = 'BIZ_1405',
  COMMENT_TOO_LONG = 'BIZ_1406',
  RATING_OUT_OF_RANGE = 'BIZ_1407',
  
  // Network Errors (1500-1599)
  NETWORK_TIMEOUT = 'NET_1501',
  CONNECTION_REFUSED = 'NET_1502',
  DNS_RESOLUTION_FAILED = 'NET_1503',
  SSL_CERTIFICATE_ERROR = 'NET_1504',
  
  // File Upload Errors (1600-1699)
  FILE_TOO_LARGE = 'FILE_1601',
  INVALID_FILE_TYPE = 'FILE_1602',
  UPLOAD_FAILED = 'FILE_1603',
  FILE_NOT_FOUND = 'FILE_1604',
  
  // Rate Limiting Errors (1700-1799)
  RATE_LIMIT_EXCEEDED = 'RATE_1701',
  TOO_MANY_REQUESTS = 'RATE_1702',
  
  // System Errors (1800-1899)
  INTERNAL_SERVER_ERROR = 'SYS_1801',
  SERVICE_UNAVAILABLE = 'SYS_1802',
  MAINTENANCE_MODE = 'SYS_1803',
  CONFIGURATION_ERROR = 'SYS_1804',
  
  // Unknown/Generic Errors (1900-1999)
  UNKNOWN_ERROR = 'GEN_1901',
  OPERATION_FAILED = 'GEN_1902'
}

// Error Messages
export const ErrorMessages: Record<ErrorCodes, string> = {
  // Authentication
  [ErrorCodes.INVALID_CREDENTIALS]: 'Geçersiz kullanıcı adı veya şifre',
  [ErrorCodes.TOKEN_EXPIRED]: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın',
  [ErrorCodes.TOKEN_INVALID]: 'Geçersiz oturum token\'ı',
  [ErrorCodes.USER_NOT_FOUND]: 'Kullanıcı bulunamadı',
  [ErrorCodes.EMAIL_NOT_CONFIRMED]: 'E-posta adresi doğrulanmamış',
  [ErrorCodes.PASSWORD_TOO_WEAK]: 'Şifre çok zayıf',
  [ErrorCodes.EMAIL_ALREADY_EXISTS]: 'Bu e-posta adresi zaten kullanımda',
  [ErrorCodes.SIGNUP_DISABLED]: 'Kayıt işlemi şu anda devre dışı',
  
  // Authorization
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Bu işlem için yeterli yetkiniz yok',
  [ErrorCodes.RESOURCE_ACCESS_DENIED]: 'Bu kaynağa erişim reddedildi',
  [ErrorCodes.ADMIN_REQUIRED]: 'Bu işlem için admin yetkisi gerekli',
  
  // Validation
  [ErrorCodes.REQUIRED_FIELD_MISSING]: 'Zorunlu alan eksik',
  [ErrorCodes.INVALID_EMAIL_FORMAT]: 'Geçersiz e-posta formatı',
  [ErrorCodes.INVALID_URL_FORMAT]: 'Geçersiz URL formatı',
  [ErrorCodes.VALUE_TOO_SHORT]: 'Değer çok kısa',
  [ErrorCodes.VALUE_TOO_LONG]: 'Değer çok uzun',
  [ErrorCodes.INVALID_NUMBER_RANGE]: 'Sayı geçerli aralıkta değil',
  [ErrorCodes.INVALID_DATE_FORMAT]: 'Geçersiz tarih formatı',
  [ErrorCodes.INVALID_ENUM_VALUE]: 'Geçersiz seçenek değeri',
  
  // Database
  [ErrorCodes.RECORD_NOT_FOUND]: 'Kayıt bulunamadı',
  [ErrorCodes.DUPLICATE_RECORD]: 'Bu kayıt zaten mevcut',
  [ErrorCodes.FOREIGN_KEY_CONSTRAINT]: 'İlişkili kayıt bulunamadı',
  [ErrorCodes.UNIQUE_CONSTRAINT]: 'Bu değer zaten kullanımda',
  [ErrorCodes.CHECK_CONSTRAINT]: 'Veri doğrulama hatası',
  [ErrorCodes.CONNECTION_FAILED]: 'Veritabanı bağlantısı başarısız',
  [ErrorCodes.TRANSACTION_FAILED]: 'İşlem başarısız oldu',
  
  // Business Logic
  [ErrorCodes.INSUFFICIENT_BALANCE]: 'Yetersiz bakiye',
  [ErrorCodes.STAKE_ALREADY_EXISTS]: 'Bu protokol için zaten stake mevcut',
  [ErrorCodes.STAKE_NOT_MATURE]: 'Stake henüz olgunlaşmamış',
  [ErrorCodes.PROTOCOL_INACTIVE]: 'Protokol aktif değil',
  [ErrorCodes.REWARD_ALREADY_CLAIMED]: 'Ödül zaten talep edilmiş',
  [ErrorCodes.COMMENT_TOO_LONG]: 'Yorum çok uzun',
  [ErrorCodes.RATING_OUT_OF_RANGE]: 'Değerlendirme geçerli aralıkta değil',
  
  // Network
  [ErrorCodes.NETWORK_TIMEOUT]: 'Ağ zaman aşımı',
  [ErrorCodes.CONNECTION_REFUSED]: 'Bağlantı reddedildi',
  [ErrorCodes.DNS_RESOLUTION_FAILED]: 'DNS çözümlemesi başarısız',
  [ErrorCodes.SSL_CERTIFICATE_ERROR]: 'SSL sertifika hatası',
  
  // File Upload
  [ErrorCodes.FILE_TOO_LARGE]: 'Dosya çok büyük',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Geçersiz dosya türü',
  [ErrorCodes.UPLOAD_FAILED]: 'Dosya yükleme başarısız',
  [ErrorCodes.FILE_NOT_FOUND]: 'Dosya bulunamadı',
  
  // Rate Limiting
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'İstek sınırı aşıldı',
  [ErrorCodes.TOO_MANY_REQUESTS]: 'Çok fazla istek',
  
  // System
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Sunucu hatası',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Servis kullanılamıyor',
  [ErrorCodes.MAINTENANCE_MODE]: 'Bakım modu aktif',
  [ErrorCodes.CONFIGURATION_ERROR]: 'Yapılandırma hatası',
  
  // Generic
  [ErrorCodes.UNKNOWN_ERROR]: 'Bilinmeyen hata',
  [ErrorCodes.OPERATION_FAILED]: 'İşlem başarısız oldu'
}

// Error Classes
export class AppError extends Error {
  public readonly code: ErrorCodes
  public readonly timestamp: string
  public readonly requestId?: string
  public readonly details?: Record<string, any>

  constructor(
    code: ErrorCodes,
    message?: string,
    requestId?: string,
    details?: Record<string, any>
  ) {
    super(message || ErrorMessages[code])
    this.name = 'AppError'
    this.code = code
    this.timestamp = new Date().toISOString()
    this.requestId = requestId
    this.details = details
  }

  toJSON(): BaseError {
    return {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      requestId: this.requestId
    }
  }
}

export class ValidationAppError extends AppError implements ValidationError {
  public readonly field: string
  public readonly value?: any
  public readonly constraints: string[]

  constructor(
    field: string,
    constraints: string[],
    value?: any,
    requestId?: string
  ) {
    super(ErrorCodes.REQUIRED_FIELD_MISSING, `Validation failed for field: ${field}`, requestId)
    this.field = field
    this.value = value
    this.constraints = constraints
  }
}

export class DatabaseAppError extends AppError implements DatabaseError {
  public readonly table?: string
  public readonly operation?: 'select' | 'insert' | 'update' | 'delete'
  public readonly constraint?: string

  constructor(
    code: ErrorCodes,
    table?: string,
    operation?: 'select' | 'insert' | 'update' | 'delete',
    constraint?: string,
    requestId?: string
  ) {
    super(code, undefined, requestId)
    this.table = table
    this.operation = operation
    this.constraint = constraint
  }
}

export class AuthenticationAppError extends AppError implements AuthenticationError {
  public readonly reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'user_not_found' | 'email_not_confirmed'

  constructor(
    reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'user_not_found' | 'email_not_confirmed',
    requestId?: string
  ) {
    const codeMap = {
      invalid_credentials: ErrorCodes.INVALID_CREDENTIALS,
      token_expired: ErrorCodes.TOKEN_EXPIRED,
      token_invalid: ErrorCodes.TOKEN_INVALID,
      user_not_found: ErrorCodes.USER_NOT_FOUND,
      email_not_confirmed: ErrorCodes.EMAIL_NOT_CONFIRMED
    }
    
    super(codeMap[reason], undefined, requestId)
    this.reason = reason
  }
}

export class AuthorizationAppError extends AppError implements AuthorizationError {
  public readonly resource: string
  public readonly action: string
  public readonly userId?: string

  constructor(
    resource: string,
    action: string,
    userId?: string,
    requestId?: string
  ) {
    super(ErrorCodes.INSUFFICIENT_PERMISSIONS, undefined, requestId)
    this.resource = resource
    this.action = action
    this.userId = userId
  }
}

export class NetworkAppError extends AppError implements NetworkError {
  public readonly status?: number
  public readonly statusText?: string
  public readonly url?: string

  constructor(
    code: ErrorCodes,
    status?: number,
    statusText?: string,
    url?: string,
    requestId?: string
  ) {
    super(code, undefined, requestId)
    this.status = status
    this.statusText = statusText
    this.url = url
  }
}

// Error Utilities
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function isValidationError(error: any): error is ValidationAppError {
  return error instanceof ValidationAppError
}

export function isDatabaseError(error: any): error is DatabaseAppError {
  return error instanceof DatabaseAppError
}

export function isAuthenticationError(error: any): error is AuthenticationAppError {
  return error instanceof AuthenticationAppError
}

export function isAuthorizationError(error: any): error is AuthorizationAppError {
  return error instanceof AuthorizationAppError
}

export function isNetworkError(error: any): error is NetworkAppError {
  return error instanceof NetworkAppError
}

// Error Factory Functions
export function createValidationError(
  field: string,
  constraints: string[],
  value?: any,
  requestId?: string
): ValidationAppError {
  return new ValidationAppError(field, constraints, value, requestId)
}

export function createDatabaseError(
  code: ErrorCodes,
  table?: string,
  operation?: 'select' | 'insert' | 'update' | 'delete',
  constraint?: string,
  requestId?: string
): DatabaseAppError {
  return new DatabaseAppError(code, table, operation, constraint, requestId)
}

export function createAuthenticationError(
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'user_not_found' | 'email_not_confirmed',
  requestId?: string
): AuthenticationAppError {
  return new AuthenticationAppError(reason, requestId)
}

export function createAuthorizationError(
  resource: string,
  action: string,
  userId?: string,
  requestId?: string
): AuthorizationAppError {
  return new AuthorizationAppError(resource, action, userId, requestId)
}

export function createNetworkError(
  code: ErrorCodes,
  status?: number,
  statusText?: string,
  url?: string,
  requestId?: string
): NetworkAppError {
  return new NetworkAppError(code, status, statusText, url, requestId)
}

// Error Handler
export function handleError(error: unknown, requestId?: string): AppError {
  if (isAppError(error)) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(ErrorCodes.UNKNOWN_ERROR, error.message, requestId)
  }
  
  return new AppError(ErrorCodes.UNKNOWN_ERROR, 'An unknown error occurred', requestId)
}