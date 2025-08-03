"use client"

interface PaymentStatusPollerOptions {
  orderId: string
  onSuccess: (data: any) => void
  onFailure: (error: string) => void
  onPending: () => void
  maxAttempts?: number
  intervalMs?: number
}

export class PaymentStatusPoller {
  private orderId: string
  private onSuccess: (data: any) => void
  private onFailure: (error: string) => void
  private onPending: () => void
  private maxAttempts: number
  private intervalMs: number
  private attempts = 0
  private intervalId: NodeJS.Timeout | null = null

  constructor(options: PaymentStatusPollerOptions) {
    this.orderId = options.orderId
    this.onSuccess = options.onSuccess
    this.onFailure = options.onFailure
    this.onPending = options.onPending
    this.maxAttempts = options.maxAttempts || 30 // 5 minutes with 10s intervals
    this.intervalMs = options.intervalMs || 10000 // 10 seconds
  }

  start() {
    console.log(`Starting payment status polling for order: ${this.orderId}`)
    this.checkStatus()
    this.intervalId = setInterval(() => this.checkStatus(), this.intervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkStatus() {
    try {
      this.attempts++
      console.log(`Checking payment status (attempt ${this.attempts}/${this.maxAttempts})`)

      const response = await fetch("/api/check-donation-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: this.orderId }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const status = result.data.status?.toLowerCase()

        switch (status) {
          case "success":
          case "completed":
            this.stop()
            this.onSuccess(result.data)
            break

          case "failed":
          case "failure":
            this.stop()
            this.onFailure(result.data.remark || "Payment failed")
            break

          case "pending":
          default:
            this.onPending()
            break
        }
      }

      // Stop polling after max attempts
      if (this.attempts >= this.maxAttempts) {
        this.stop()
        this.onFailure("Payment status check timeout")
      }
    } catch (error) {
      console.error("Error checking payment status:", error)

      if (this.attempts >= this.maxAttempts) {
        this.stop()
        this.onFailure("Failed to check payment status")
      }
    }
  }
}
