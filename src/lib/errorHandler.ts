import toast from 'react-hot-toast'

// Type guard for error objects
function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string'
}

function isErrorWithStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error && typeof (error as { status: unknown }).status === 'number'
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: unknown }).code === 'string'
}

// Hata türleri
export interface AppError {
  message: string
  code?: string
  details?: Record<string, unknown>
  timestamp: Date
  userId?: string
}

// Hata kategorileri
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

// Hata seviyesi
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Hata kategorisini belirle
function categorizeError(error: unknown): ErrorCategory {
  const message = isErrorWithMessage(error) ? error.message.toLowerCase() : ''
  const code = isErrorWithCode(error) ? error.code.toLowerCase() : ''

  // Authentication hataları
  if (message.includes('auth') || message.includes('login') || message.includes('unauthorized') ||
      code.includes('auth') || (isErrorWithStatus(error) && error.status === 401)) {
    return ErrorCategory.AUTHENTICATION
  }

  // Database hataları
  if (message.includes('database') || message.includes('sql') || message.includes('supabase') ||
      code.includes('pgrst') || code.includes('23') || (isErrorWithStatus(error) && error.status === 409)) {
    return ErrorCategory.DATABASE
  }

  // Network hataları
  if (message.includes('network') || message.includes('fetch') || message.includes('connection') ||
      (isErrorWithStatus(error) && error.status >= 500) || (error instanceof Error && error.name === 'NetworkError')) {
    return ErrorCategory.NETWORK
  }

  // Validation hataları
  if (message.includes('validation') || message.includes('invalid') || message.includes('required') ||
      (isErrorWithStatus(error) && (error.status === 400 || error.status === 422))) {
    return ErrorCategory.VALIDATION
  }

  // Permission hataları
  if (message.includes('permission') || message.includes('forbidden') || message.includes('access') ||
      (isErrorWithStatus(error) && error.status === 403)) {
    return ErrorCategory.PERMISSION
  }

  return ErrorCategory.UNKNOWN
}

// Hata seviyesini belirle
function determineSeverity(category: ErrorCategory, error: unknown): ErrorSeverity {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      return ErrorSeverity.HIGH
    case ErrorCategory.DATABASE:
      return isErrorWithStatus(error) && error.status >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.MEDIUM
    case ErrorCategory.NETWORK:
      return ErrorSeverity.MEDIUM
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.LOW
    case ErrorCategory.PERMISSION:
      return ErrorSeverity.HIGH
    default:
      return ErrorSeverity.MEDIUM
  }
}

// Kullanıcı dostu hata mesajları
function getUserFriendlyMessage(category: ErrorCategory, error: unknown): string {
  const originalMessage = isErrorWithMessage(error) ? error.message : 'Bilinmeyen bir hata oluştu'

  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      if (originalMessage.includes('Invalid login credentials')) {
        return 'E-posta veya şifre hatalı'
      }
      if (originalMessage.includes('Email not confirmed')) {
        return 'E-posta adresinizi doğrulamanız gerekiyor'
      }
      if (originalMessage.includes('User not found')) {
        return 'Kullanıcı bulunamadı'
      }
      return 'Giriş yapma sorunu. Lütfen tekrar deneyin.'

    case ErrorCategory.DATABASE:
      if (originalMessage.includes('duplicate key')) {
        return 'Bu kayıt zaten mevcut'
      }
      if (originalMessage.includes('foreign key')) {
        return 'İlişkili veri bulunamadı'
      }
      if (originalMessage.includes('not found')) {
        return 'Aranan veri bulunamadı'
      }
      return 'Veri işleme hatası. Lütfen tekrar deneyin.'

    case ErrorCategory.NETWORK:
      if (originalMessage.includes('timeout')) {
        return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
      }
      if (originalMessage.includes('offline')) {
        return 'İnternet bağlantınızı kontrol edin'
      }
      return 'Bağlantı sorunu. Lütfen tekrar deneyin.'

    case ErrorCategory.VALIDATION:
      if (originalMessage.includes('required')) {
        return 'Gerekli alanları doldurun'
      }
      if (originalMessage.includes('invalid email')) {
        return 'Geçerli bir e-posta adresi girin'
      }
      if (originalMessage.includes('password')) {
        return 'Şifre gereksinimlerini kontrol edin'
      }
      return 'Girilen bilgileri kontrol edin'

    case ErrorCategory.PERMISSION:
      return 'Bu işlem için yetkiniz bulunmuyor'

    default:
      return originalMessage
  }
}

// Ana hata işleyici
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []
  private maxLogSize = 100

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Hatayı işle
  handleError(error: unknown, context?: string, userId?: string): AppError {
    const category = categorizeError(error)
    const severity = determineSeverity(category, error)
    const userMessage = getUserFriendlyMessage(category, error)

    const appError: AppError = {
      message: userMessage,
      code: isErrorWithCode(error) ? error.code : (isErrorWithStatus(error) ? error.status.toString() : undefined),
      details: {
        originalMessage: isErrorWithMessage(error) ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        context,
        category,
        severity,
      },
      timestamp: new Date(),
      userId,
    }

    // Hata logunu kaydet
    this.logError(appError)

    // Kullanıcıya göster
    this.showErrorToUser(appError)

    // Kritik hataları raporla
    if (severity === ErrorSeverity.CRITICAL) {
      this.reportCriticalError(appError)
    }

    return appError
  }

  // Hata logunu kaydet
  private logError(error: AppError): void {
    // Console'a yazdır (development)
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${error.details?.severity}]`)
      console.error('Message:', error.message)
      console.error('Code:', error.code)
      console.error('Context:', error.details?.context)
      console.error('Original:', error.details?.originalMessage)
      console.error('Stack:', error.details?.stack)
      console.groupEnd()
    }

    // Local storage'a kaydet
    this.errorLog.unshift(error)
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    try {
      localStorage.setItem('app_error_log', JSON.stringify(this.errorLog.slice(0, 10)))
    } catch (e) {
      // localStorage hatası - sessizce geç
    }
  }

  // Kullanıcıya hata göster
  private showErrorToUser(error: AppError): void {
    const severity = error.details?.severity

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(error.message, {
          duration: 8000,
          style: {
            background: '#dc2626',
            color: 'white',
          },
        })
        break

      case ErrorSeverity.HIGH:
        toast.error(error.message, {
          duration: 6000,
        })
        break

      case ErrorSeverity.MEDIUM:
        toast.error(error.message, {
          duration: 4000,
        })
        break

      case ErrorSeverity.LOW:
        toast(error.message, {
          icon: '⚠️',
          duration: 3000,
        })
        break

      default:
        toast.error(error.message)
    }
  }

  // Kritik hataları raporla
  private async reportCriticalError(error: AppError): Promise<void> {
    try {
      // Supabase'e kritik hata kaydet (opsiyonel)
      // Not implemented - error_logs table doesn't exist in current schema
      console.error('Critical Error:', {
        message: error.message,
        code: error.code || 'UNKNOWN',
        userId: error.userId,
        timestamp: error.timestamp.toISOString(),
      })
    } catch (e) {
      // Hata raporlama başarısız - sessizce geç
      console.warn('Failed to report critical error:', e)
    }
  }

  // Hata loglarını getir
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  // Hata loglarını temizle
  clearErrorLog(): void {
    this.errorLog = []
    try {
      localStorage.removeItem('app_error_log')
    } catch (e) {
      // localStorage hatası - sessizce geç
    }
  }

  // Retry mekanizması
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          break
        }

        // Network hatalarında retry yap
        const category = categorizeError(error)
        if (category === ErrorCategory.NETWORK) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
          continue
        }

        // Diğer hatalarda retry yapma
        break
      }
    }

    throw lastError
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance()

// React Query için error handler
export function handleQueryError(error: unknown, context?: string): void {
  errorHandler.handleError(error, context)
}

// Async işlemler için wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
  userId?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    errorHandler.handleError(error, context, userId)
    throw error
  }
}

// Global error boundary için
export function handleGlobalError(error: Error): void {
  errorHandler.handleError(error, 'Global Error Boundary', undefined)
}

// Unhandled promise rejection handler
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, 'Unhandled Promise Rejection')
  })

  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, 'Global Error Event')
  })
}