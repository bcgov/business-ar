import type { NuxtError } from '#app'
import { ErrorCategory } from '~/enums/error-category'
import { ErrorCode } from '~/enums/error-code'

export interface Error {
  category: ErrorCategory,
  detail?: string,
  message: string,
  statusCode: number,
  type?: ErrorCode
}

export interface FormPathError {
  path: string,
  message: string
}

export interface ApiError extends NuxtError {
  data?: {
    message?: string;
    detail?: string;
  }
}
