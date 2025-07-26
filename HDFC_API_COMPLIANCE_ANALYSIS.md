# 🔍 HDFC SmartGateway API Compliance Analysis

## 📋 **Current Implementation vs HDFC Documentation**

### ✅ **What's Already Correct:**

1. **Payment Session Creation** (`/api/payment/session`)
   - ✅ POST method
   - ✅ JSON request body
   - ✅ Required headers: Authorization, x-merchantid, x-customerid
   - ✅ Proper authentication format

2. **Payment Response Handler** (`/api/payment/response`)
   - ✅ Form data handling (not JSON)
   - ✅ Signature verification with 7-step algorithm
   - ✅ HTML redirect responses
   - ✅ Status handling (CHARGED, FAILED, PENDING)

3. **Refund Processing** (`/api/payment/refund`)
   - ✅ POST method with JSON body
   - ✅ Required fields and headers

4. **Webhook Handler** (`/api/webhook`)
   - ✅ POST method with JSON body
   - ✅ Signature verification

## 🚨 **Critical Discrepancies Found:**

### **1. Payment Status API Issues**

#### **Current Implementation Problems:**
```typescript
// ❌ Missing required headers according to HDFC docs
const response = await fetch(`${this.config.baseUrl}/orders/${orderId}`, {
  method: 'GET',
  headers: {
    'Authorization': this.getAuthHeader(),
    'version': '2023-06-30',
    'x-resellerid': 'hdfc_reseller', // ❌ Not in HDFC docs
  },
});
```

#### **HDFC Documentation Requirements:**
```http
Authorization: Basic {base64_encoded_api_key}
Content-Type: application/json
version: 2023-06-30
x-merchantid: {merchant_id}
x-customerid: {customer_id}
```

#### **Issues:**
- ❌ Missing `Content-Type: application/json`
- ❌ Missing `x-merchantid` header
- ❌ Missing `x-customerid` header
- ❌ Using `x-resellerid` (not in HDFC docs)
- ❌ Response format doesn't match HDFC structure

### **2. Response Type Mismatch**

#### **HDFC Documentation Response:**
```json
{
  "order_id": "ORD1753422226913639",
  "order_status": "charged",       // ❌ Our code expects "status"
  "status_id": "21",
  "transaction_id": "TXN123",      // ❌ Our code expects "txn_id"
  "amount": "100.00",              // ❌ String format
  "payment_method": "credit_card",
  "bank_ref_no": "HDFC123456789",
  "customer_id": "CUSTjohndoe1753422226",
  "merchant_id": "your_merchant_id",
  "created_at": "2024-12-21T10:30:00Z",
  "updated_at": "2024-12-21T10:35:00Z",
  "currency": "INR",
  "gateway_response": {
    "gateway_transaction_id": "GTW123456789",
    "auth_code": "AUTH123",
    "rrn": "RRN123456789"
  }
}
```

#### **Our Current Type Definition (Incorrect):**
```typescript
// ❌ Based on old/incorrect format
export interface HDFCOrderStatusResponse {
  customer_email: string;
  status: "CHARGED" | "FAILED" | "PENDING";
  txn_id: string;
  // ... complex nested structure that may not match actual API
}
```

### **3. Payment Response Handler Issues**

#### **HDFC Documentation vs Our Implementation:**

**HDFC sends (according to docs):**
- `transaction_id` (not `txn_id`)
- `order_status` (not `status`)

**Our current code:**
```typescript
// ❌ May be incorrect field names
const transactionId = body.txn_id || body.transaction_id;
const status = body.status; // Should be body.order_status?
```

### **4. Environment Variables Mismatch**

#### **HDFC Documentation:**
```bash
HDFC_SANDBOX_URL=https://smartgatewayuat.hdfcbank.com/session
HDFC_PRODUCTION_URL=https://smartgateway.hdfcbank.com/session
```

#### **Our Current Implementation:**
```typescript
// ❌ Hardcoded URLs, not using env vars
const baseUrls = {
  sandbox: 'https://smartgatewayuat.hdfcbank.com',
  production: 'https://smartgateway.hdfcbank.com'
};
```

## 🔧 **Required Fixes:**

### **1. Fix Payment Status API Headers**
```typescript
// ✅ Correct headers according to HDFC docs
const response = await fetch(`${this.config.baseUrl}/orders/${orderId}`, {
  method: 'GET',
  headers: {
    'Authorization': this.getAuthHeader(),
    'Content-Type': 'application/json',
    'version': '2023-06-30',
    'x-merchantid': this.config.merchantId,
    'x-customerid': this.generateCustomerId(orderId),
  },
});
```

### **2. Update Response Type to Match HDFC Docs**
```typescript
export interface HDFCOrderStatusResponse {
  order_id: string;
  order_status: string;  // ✅ HDFC uses "order_status"
  status_id: string;
  transaction_id: string; // ✅ HDFC uses "transaction_id"
  amount: string;         // ✅ String format
  payment_method: string;
  bank_ref_no: string;
  customer_id: string;
  merchant_id: string;
  created_at: string;
  updated_at: string;
  currency: string;
  gateway_response: {
    gateway_transaction_id: string;
    auth_code: string;
    rrn: string;
  };
}
```

### **3. Fix Payment Response Field Names**
```typescript
// ✅ Use correct HDFC field names
const transactionId = body.transaction_id; // HDFC uses transaction_id
const status = body.order_status || body.status; // Check both
```

### **4. Add Environment Variable Support**
```typescript
const baseUrls = {
  sandbox: process.env.HDFC_SANDBOX_URL || 'https://smartgatewayuat.hdfcbank.com',
  production: process.env.HDFC_PRODUCTION_URL || 'https://smartgateway.hdfcbank.com'
};
```

### **5. Add Status Mapping**
```typescript
// HDFC Status Values (from docs)
const statusMapping = {
  'charged': 'CHARGED',
  'failed': 'FAILED', 
  'pending': 'PENDING',
  'declined': 'DECLINED',
  'cancelled': 'CANCELLED',
  'refunded': 'REFUNDED'
};
```

## 🎯 **Priority Actions:**

1. **High Priority**: Fix payment status API headers and response format
2. **High Priority**: Verify field names in payment response handler
3. **Medium Priority**: Update type definitions to match HDFC docs exactly
4. **Low Priority**: Add environment variable support for URLs

## 🧪 **Testing Requirements:**

1. Test payment status API with real HDFC sandbox
2. Verify payment response field mapping
3. Check webhook payload format
4. Validate all status value mappings

## 📞 **Questions for HDFC Support:**

1. Confirm exact field names in payment response (`txn_id` vs `transaction_id`)
2. Verify if `x-resellerid` header is actually required
3. Clarify status value format (lowercase vs uppercase)
4. Confirm webhook payload structure

**Next Step: Implement these fixes to ensure 100% HDFC API compliance!** 🚀 