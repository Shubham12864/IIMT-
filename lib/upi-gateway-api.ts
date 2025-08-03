const UPI_GATEWAY_API_KEY = "API-c5c8521b-cd3d-45ab-bbe9-b71108a77b3d"
const UPI_GATEWAY_BASE_URL = "https://api.ekqr.in/api"

interface CreateOrderRequest {
  key: string
  client_txn_id: string
  amount: string
  p_info: string
  customer_name: string
  customer_email: string
  customer_mobile: string
  redirect_url: string
  udf1?: string
  udf2?: string
}

interface CreateOrderResponse {
  status: boolean
  msg: string
  data?: {
    order_id: string
    payment_url: string
    upi_id_hash: string
    upi_intent: {
      bhim_link: string
      phonepe_link: string
      paytm_link: string
      gpay_link: string
    }
  }
}

interface CheckOrderRequest {
  key: string
  client_txn_id: string
  txn_date: string
}

interface CheckOrderResponse {
  status: boolean
  msg: string
  data?: {
    id: string
    amount: string
    client_txn_id: string
    customer_name: string
    customer_email: string
    customer_mobile: string
    customer_vpa?: string
    status: string
    txnAt: string
    createdAt: string
    remark: string
  }
}

export class UPIGatewayAPI {
  private static async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`Making request to: ${UPI_GATEWAY_BASE_URL}${endpoint}`)
      console.log("Request data:", data)

      const response = await fetch(`${UPI_GATEWAY_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()
      console.log("API Response:", responseData)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return responseData
    } catch (error) {
      console.error(`UPI Gateway API error (${endpoint}):`, error)
      throw error
    }
  }

  static async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    return this.makeRequest<CreateOrderResponse>("/create_order", orderData)
  }

  static async checkOrderStatus(statusData: CheckOrderRequest): Promise<CheckOrderResponse> {
    return this.makeRequest<CheckOrderResponse>("/check_order_status", statusData)
  }

  static formatDate(date: Date): string {
    // Format: DD-MM-YYYY (as required by UPI Gateway)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }
}
