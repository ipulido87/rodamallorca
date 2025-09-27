export interface ApiError {
  response?: {
    status: number
    data?: {
      message?: string
    }
  }
}

export interface ApiResponse<T> {
  data: T
  message?: string
}
