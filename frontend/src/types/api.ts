export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
