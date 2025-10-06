import "server-only";
import * as Sentry from "@sentry/nextjs";

// Error severity levels per ERRORS.md
export enum ErrorSeverity {
  SEV1 = "SEV1", // Data loss or mass send errors
  SEV2 = "SEV2", // Sync failures or performance degradation  
  SEV3 = "SEV3", // UI bugs and non-blocking issues
}

// Error categories for fingerprinting
export enum ErrorCategory {
  // GHL Integration
  GHL_WEBHOOK = "ghl_webhook",
  GHL_API = "ghl_api",
  GHL_SYNC = "ghl_sync",
  
  // Database
  DB_QUERY = "db_query",
  DB_CONNECTION = "db_connection",
  
  // AI/LLM
  LLM_API = "llm_api",
  LLM_GENERATION = "llm_generation",
  LLM_SAFETY = "llm_safety",
  
  // Messaging
  MESSAGE_SEND = "message_send",
  MESSAGE_APPROVAL = "message_approval",
  
  // Auth
  AUTH_LOGIN = "auth_login",
  AUTH_PERMISSION = "auth_permission",
  
  // System
  SYSTEM_FATAL = "system_fatal",
  SYSTEM_CONFIG = "system_config",
}

export interface ErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

// Initialize Sentry
export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event, hint) {
        // Redact PII from error context
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
}

// Capture error with context
export function captureError(error: Error, context: ErrorContext) {
  const { category, severity, userId, correlationId, metadata } = context;

  console.error(`[${severity}] [${category}]`, error.message, metadata);

  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      // Set fingerprint for grouping similar errors
      scope.setFingerprint([category, error.message]);
      
      // Set severity level
      scope.setLevel(severityToSentryLevel(severity));
      
      // Set tags for filtering
      scope.setTag("category", category);
      scope.setTag("severity", severity);
      
      // Set user context (without PII)
      if (userId) {
        scope.setUser({ id: userId });
      }
      
      // Set correlation ID for tracing
      if (correlationId) {
        scope.setTag("correlation_id", correlationId);
      }
      
      // Add metadata
      if (metadata) {
        scope.setContext("metadata", metadata);
      }
      
      Sentry.captureException(error);
    });
  }
}

// Capture message (non-error events)
export function captureMessage(
  message: string,
  context: Omit<ErrorContext, "severity"> & { severity?: ErrorSeverity }
) {
  const { category, severity = ErrorSeverity.SEV3, userId, correlationId, metadata } = context;

  console.log(`[${severity}] [${category}]`, message, metadata);

  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setFingerprint([category, message]);
      scope.setLevel(severityToSentryLevel(severity));
      scope.setTag("category", category);
      scope.setTag("severity", severity);
      
      if (userId) {
        scope.setUser({ id: userId });
      }
      
      if (correlationId) {
        scope.setTag("correlation_id", correlationId);
      }
      
      if (metadata) {
        scope.setContext("metadata", metadata);
      }
      
      Sentry.captureMessage(message);
    });
  }
}

// Convert severity to Sentry level
function severityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
  switch (severity) {
    case ErrorSeverity.SEV1:
      return "fatal";
    case ErrorSeverity.SEV2:
      return "error";
    case ErrorSeverity.SEV3:
      return "warning";
    default:
      return "info";
  }
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  if (process.env.SENTRY_DSN) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
}

// Helper for common error patterns
export const errorHelpers = {
  ghlWebhook: (error: Error, correlationId: string, payload?: any) =>
    captureError(error, {
      category: ErrorCategory.GHL_WEBHOOK,
      severity: ErrorSeverity.SEV2,
      correlationId,
      metadata: { payload },
    }),

  ghlApi: (error: Error, endpoint: string, correlationId?: string) =>
    captureError(error, {
      category: ErrorCategory.GHL_API,
      severity: ErrorSeverity.SEV2,
      correlationId,
      metadata: { endpoint },
    }),

  dbQuery: (error: Error, query: string, userId?: string) =>
    captureError(error, {
      category: ErrorCategory.DB_QUERY,
      severity: ErrorSeverity.SEV2,
      userId,
      metadata: { query },
    }),

  llmGeneration: (error: Error, promptType: string, userId: string) =>
    captureError(error, {
      category: ErrorCategory.LLM_GENERATION,
      severity: ErrorSeverity.SEV2,
      userId,
      metadata: { promptType },
    }),

  messageSend: (error: Error, messageId: string, channel: string) =>
    captureError(error, {
      category: ErrorCategory.MESSAGE_SEND,
      severity: ErrorSeverity.SEV1, // SEV1 because messaging failures are critical
      metadata: { messageId, channel },
    }),

  authPermission: (error: Error, userId: string, resource: string) =>
    captureError(error, {
      category: ErrorCategory.AUTH_PERMISSION,
      severity: ErrorSeverity.SEV3,
      userId,
      metadata: { resource },
    }),
};

