export type ErrorCode =
  | 'RATE_LIMITED'
  | 'LLM_TIMEOUT'
  | 'LLM_QUOTA_EXCEEDED'
  | 'VALIDATION_ERROR'
  | 'STORE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR';

export interface FriendlyError {
  code: ErrorCode;
  title: string;
  message: string;
  actionText?: string;
}

export function mapErrorToFriendly(code: ErrorCode | string, customMessage?: string): FriendlyError {
  switch (code) {
    case 'RATE_LIMITED':
      return {
        code: 'RATE_LIMITED',
        title: 'Hourly Limit Reached',
        message: customMessage || 'You have used your free AI generations for this hour. Please try again shortly.',
        actionText: 'Wait and retry',
      };
    case 'LLM_TIMEOUT':
      return {
        code: 'LLM_TIMEOUT',
        title: 'Taking Longer Than Usual',
        message: 'Our AI took a little longer to respond. We have prepared a starter template you can customize right away.',
        actionText: 'Use starter template',
      };
    case 'LLM_QUOTA_EXCEEDED':
      return {
        code: 'LLM_QUOTA_EXCEEDED',
        title: 'High AI Traffic',
        message: 'The AI model is currently busy. We loaded our curated starter storefront so you can continue editing without interruption.',
        actionText: 'Continue editing',
      };
    case 'VALIDATION_ERROR':
      return {
        code: 'VALIDATION_ERROR',
        title: 'Check Your Input',
        message: customMessage || 'Please ensure your description is between 10 and 600 characters.',
        actionText: 'Edit description',
      };
    case 'UNAUTHORIZED':
      return {
        code: 'UNAUTHORIZED',
        title: 'Edit Access Required',
        message: 'You need the private edit link to modify this store.',
        actionText: 'Create a new store',
      };
    case 'STORE_NOT_FOUND':
      return {
        code: 'STORE_NOT_FOUND',
        title: 'Store Not Found',
        message: 'This storefront does not exist or has been deleted.',
        actionText: 'Go to home',
      };
    default:
      return {
        code: 'SERVER_ERROR',
        title: 'Something Went Wrong',
        message: customMessage || 'We hit a small bump, but your drafts are safe. Please try again.',
        actionText: 'Try again',
      };
  }
}
