-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_id VARCHAR(100) UNIQUE,
    order_id VARCHAR(100) UNIQUE,
    gateway_order_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    donation_type VARCHAR(50) DEFAULT 'general_fund',
    receipt_number VARCHAR(50) UNIQUE,
    tax_receipt_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    webhook_received_at TIMESTAMP,
    notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_donations_student_id ON donations(student_id);
CREATE INDEX idx_donations_payment_id ON donations(payment_id);
CREATE INDEX idx_donations_status ON donations(status);
