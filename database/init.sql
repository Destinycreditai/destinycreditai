-- AI Credit Education Platform Database Schema
CREATE DATABASE IF NOT EXISTS destinycreditai;
USE destinycreditai;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Credit Letters table
CREATE TABLE credit_letters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  creditor_name VARCHAR(255) NOT NULL,
  bureau ENUM('Experian', 'Equifax', 'TransUnion') NOT NULL,
  letter_type ENUM('dispute', 'validation', 'goodwill') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_bureau (bureau),
  INDEX idx_letter_type (letter_type)
);

-- Follow-up Letters table
CREATE TABLE followup_letters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  original_letter_id INT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  day INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (original_letter_id) REFERENCES credit_letters(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_original_letter (original_letter_id)
);

-- Workflows table
CREATE TABLE workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  steps JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- Insert default admin user
INSERT INTO users (name, email, role) VALUES 
('Admin User', 'admin@destinycredit.ai', 'admin'),
('Demo User', 'demo@example.com', 'user');

-- Insert default workflows
INSERT INTO workflows (name, description, status, steps) VALUES 
('Basic Credit Dispute', 'Standard 30-day dispute process for inaccurate items', 'active', 
 '{"steps": [{"day": 1, "action": "Send initial dispute letter"}, {"day": 30, "action": "Follow up if no response"}, {"day": 60, "action": "Escalate to CFPB if needed"}]}'),
('Debt Validation Request', 'Request validation of debt from collection agencies', 'active',
 '{"steps": [{"day": 1, "action": "Send validation request"}, {"day": 30, "action": "Follow up for proof"}, {"day": 45, "action": "Dispute if no validation"}]}'),
('Goodwill Letter Campaign', 'Request goodwill removal from creditors', 'active',
 '{"steps": [{"day": 1, "action": "Send goodwill letter"}, {"day": 14, "action": "Follow up call"}, {"day": 30, "action": "Send second letter"}]}');

-- Insert sample credit letters for demo
INSERT INTO credit_letters (user_id, user_name, creditor_name, bureau, letter_type, content) VALUES 
(2, 'Demo User', 'ABC Credit Card', 'Experian', 'dispute', 
 'Dear Credit Bureau,\n\nI am writing to dispute the following item on my credit report...\n\nThis is for educational purposes only.'),
(2, 'Demo User', 'XYZ Collections', 'Equifax', 'validation', 
 'Dear Collection Agency,\n\nI am requesting validation of the alleged debt...\n\nThis is for educational purposes only.');

-- Insert sample follow-up letters
INSERT INTO followup_letters (user_id, original_letter_id, user_name, day, content) VALUES 
(2, 1, 'Demo User', 30, 
 'Dear Credit Bureau,\n\nI previously sent a dispute letter 30 days ago...\n\nThis is for educational purposes only.');