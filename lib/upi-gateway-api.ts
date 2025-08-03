const UPI_GATEWAY_API_KEY = "046c6138-b457-4e46-976e-c87d884ac5ea";
const UPI_GATEWAY_BASE_URL = "https://api.ekqr.in/api";


export interface CreateOrderRequest {
  client_txn_id: string;
  amount: number;
  p_info: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
}

export interface CreateOrderResponse {
  status: boolean;
  msg: string;
  data?: {
    order_id: string;
    payment_url: string;
  };
  payment_url?: string;
}


export interface CheckOrderRequest {
  key: string;
  client_txn_id: string;
  txn_date: string;
}

export interface CheckOrderResponse {
  status: boolean;
  msg: string;
  data?: {
    id: string;
    amount: string;
    client_txn_id: string;
    customer_name: string;
    customer_email: string;
    customer_mobile: string;
    customer_vpa?: string;
    status: string;
    gateway_txn_id: string;
    txnAt: string;
    createdAt: string;
    remark: string;
  };
}


export class UPIGatewayAPI {
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || UPI_GATEWAY_API_KEY;
    this.baseURL = UPI_GATEWAY_BASE_URL;
    if (!this.apiKey) throw new Error('UPI Gateway API key is required');
  }

  async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    // Compose payload as per docs - use HTTPS URLs for redirect_url
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_APP_URL}/donation-success`
      : 'https://warm-turtles-shout.loca.lt/donation-success'; // HTTPS tunnel URL
    const webhookUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/upi-gateway`
      : 'https://warm-turtles-shout.loca.lt/api/webhooks/upi-gateway'; // HTTPS tunnel URL
    const payload = {
      key: this.apiKey,
      client_txn_id: orderData.client_txn_id,
      amount: orderData.amount.toString(),
      p_info: orderData.p_info,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_mobile: orderData.customer_mobile,
      redirect_url: redirectUrl,
      udf1: webhookUrl
    };
    
    console.log('🚀 Sending payload to UPI Gateway:', {
      ...payload,
      key: 'API-***' // Hide API key in logs
    });
    
    try {
      const response = await fetch(`${this.baseURL}/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      console.log('📦 Raw UPI Gateway Response:', responseText);
      console.log('📊 Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`UPI Gateway API Error: ${response.status} - ${responseText}`);
      }
      let result: CreateOrderResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response from UPI Gateway');
      }
      if (!result.status) {
        throw new Error(result.msg || 'UPI Gateway returned error status');
      }
      // Normalize payment_url
      const paymentUrl = result.data?.payment_url || result.payment_url;
      if (!paymentUrl) {
        throw new Error('No payment URL received from UPI Gateway');
      }
      return {
        ...result,
        payment_url: paymentUrl
      };
    } catch (error) {
      throw error;
    }
  }

  async checkOrderStatus(client_txn_id: string, txn_date: string): Promise<CheckOrderResponse> {
    const payload: CheckOrderRequest = {
      key: this.apiKey,
      client_txn_id,
      txn_date
    };
    try {
      const response = await fetch(`${this.baseURL}/check_order_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Status check API Error: ${response.status} - ${responseText}`);
      }
      let result: CheckOrderResponse;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response from status check API');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default UPIGatewayAPI;
