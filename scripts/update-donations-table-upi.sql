-- Add UPI Gateway specific columns to donations table
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS gateway_payment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS gateway_txn_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS customer_vpa VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50) DEFAULT 'upi_gateway';

-- Create indexes for UPI Gateway fields
CREATE INDEX IF NOT EXISTS idx_donations_gateway_payment_id ON donations(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_donations_gateway_txn_id ON donations(gateway_txn_id);
