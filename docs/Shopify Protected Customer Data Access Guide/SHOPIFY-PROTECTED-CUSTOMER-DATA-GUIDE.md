# Shopify Protected Customer Data Access Guide

## Overview

This guide walks through enabling Protected Customer Data access for Shopify apps. This is **required** when your app needs to access customer information like names, emails, addresses, or phone numbers through the Admin API or Customer Account API.

**Common use cases requiring this access:**
- Creating draft orders with customer information
- Processing customer data for orders
- Building customer management features
- Any app that reads/writes customer PII (Personally Identifiable Information)

---

## Prerequisites

- A Shopify Partner account
- An app created in your Partner Dashboard
- The app installed on a development store (for testing without approval)

---

## Step-by-Step Guide

### Step 1: Access Your Shopify Partners Dashboard

Navigate to [partners.shopify.com](https://partners.shopify.com) and log in.

You'll see the main Partner Dashboard with your stores and getting started checklist.

![Shopify Partners Home](images/01-partners-home.png)

---

### Step 2: Navigate to Your App

1. Click **"App distribution"** in the left sidebar (or find your app under "Apps")
2. Locate your app in the list (e.g., "Ecomm-react")
3. Click on the app name to open its settings

![App Overview](images/02-app-overview.png)

You'll see the app overview page with options for distribution, embedded app settings, and app history.

---

### Step 3: Go to API Access Requests

Click **"API access requests"** in the left sidebar under your app name.

![API Access Requests Page](images/03-api-access-requests.png)

This page shows several sections:
- Turn your app into a sales channel
- Storefront API
- **Protected customer data access** (what we need)
- Request additional scopes and APIs

---

### Step 4: Find Protected Customer Data Section

Scroll down on the API access requests page until you see the **"Protected customer data access"** section.

![Protected Customer Data Section](images/04-protected-customer-data-section.png)

Click the **"Request access"** button.

> **Important Note:** The blue info box confirms that apps on development stores can access protected data immediately without submitting for review. Production apps distributed via the App Store require Shopify approval.

---

### Step 5: Select Data Use Reasons

After clicking "Request access", you'll see a form to select your reasons for using protected customer data.

![Select Data Use Reasons](images/05-select-reasons.png)

**Check all applicable reasons:**

| Reason | Description | When to Select |
|--------|-------------|----------------|
| ✅ Customer service | Respond to customer questions on behalf of merchants | If your app handles support features |
| ✅ Store management | Print order labels or track inventory | **Required for draft orders** |
| ✅ App functionality | Bill merchants or authenticate users | Core app operations |
| ✅ Analytics | Measure app performance | If tracking customer metrics |
| ✅ Personalization | Show personalized product recommendations | For recommendation engines |
| ✅ Marketing or advertising | Send abandoned cart recovery messages | For marketing features |

Click **"Save"** after selecting your reasons.

---

### Step 6: Configure Individual Field Access

After saving the main reasons, you need to select access for each specific field type. Scroll down to see the "Protected customer fields" section.

#### 6a. Name Field

Click **"Select"** next to "Name" and check the same reasons.

![Name Field Configuration](images/06-name-field.png)

This grants access to:
- First name fields
- Last name fields

Click **"Save"**.

---

#### 6b. Email Field

Click **"Select"** next to "Email" and check the same reasons.

![Email Field Configuration](images/07-email-field.png)

This grants access to:
- Customer email addresses

Click **"Save"**.

---

#### 6c. Phone Field

Click **"Select"** next to "Phone" and check the same reasons.

![Phone Field Configuration](images/08-phone-field.png)

This grants access to:
- Default phone number fields
- Billing phone number fields

Click **"Save"**.

---

#### 6d. Address Field

Click **"Select"** next to "Address" and check the same reasons.

![Address Field Configuration](images/09-address-field.png)

This grants access to:
- Shipping address fields
- Billing address fields

Click **"Save"**.

---

## Verification

After completing all steps, your API access requests page should show all protected customer data fields as configured with their associated reasons.

You can verify the access is working by:

1. Making an API call that requires customer data
2. Checking that you no longer receive `ACCESS_DENIED` errors
3. Testing draft order creation with customer information

---

## Common Errors & Solutions

### Error: `ACCESS_DENIED` for protected customer fields

**Cause:** Protected customer data access not enabled or not saved properly.

**Solution:** 
1. Return to API access requests
2. Verify all fields (Name, Email, Phone, Address) show "Selected" with reasons
3. Re-save if necessary

### Error: Can't access customer data in production

**Cause:** Production apps require Shopify approval for protected data access.

**Solution:**
1. Submit your app for review
2. Provide justification for each data type requested
3. Wait for Shopify approval (usually 1-5 business days)

### Error: Fields not appearing in GraphQL responses

**Cause:** API scopes may also need to be configured in your app's configuration.

**Solution:**
1. Check your app's `shopify.app.toml` or Admin API configuration
2. Ensure `read_customers`, `write_customers`, `read_orders`, `write_orders` scopes are included
3. Reinstall the app to apply new scopes

---

## Required API Scopes Reference

For draft orders with customer data, ensure your app has these scopes:

```toml
# shopify.app.toml
[access_scopes]
scopes = "read_products,write_products,read_orders,write_orders,read_draft_orders,write_draft_orders,read_customers,write_customers"
```

Or in your app configuration:

```javascript
// Admin API scopes
const SCOPES = [
  'read_products',
  'write_products', 
  'read_orders',
  'write_orders',
  'read_draft_orders',
  'write_draft_orders',
  'read_customers',
  'write_customers'
];
```

---

## GraphQL Example: Creating Draft Order with Customer Data

Once protected customer data access is enabled, you can create draft orders like this:

```graphql
mutation draftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      name
      totalPrice
      customer {
        id
        firstName
        lastName
        email
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables:
```json
{
  "input": {
    "email": "customer@example.com",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "address1": "123 Main St",
      "city": "New York",
      "province": "NY",
      "zip": "10001",
      "country": "US"
    },
    "lineItems": [
      {
        "variantId": "gid://shopify/ProductVariant/12345",
        "quantity": 1
      }
    ]
  }
}
```

---

## Summary Checklist

- [ ] Logged into Shopify Partners Dashboard
- [ ] Navigated to your app
- [ ] Clicked "API access requests" in sidebar
- [ ] Clicked "Request access" under Protected customer data
- [ ] Selected reasons for Protected customer data (main)
- [ ] Configured Name field with reasons
- [ ] Configured Email field with reasons  
- [ ] Configured Phone field with reasons
- [ ] Configured Address field with reasons
- [ ] Saved all configurations
- [ ] Tested API access with customer data

---

## Related Resources

- [Shopify Protected Customer Data Documentation](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Shopify Admin API Scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Draft Orders API Reference](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderCreate)

---

## Document Info

| Field | Value |
|-------|-------|
| Created | January 11, 2026 |
| Author | Hydrogen Forge Team |
| Version | 1.0 |
| Last Updated | January 11, 2026 |

---

*This guide is part of the Hydrogen Forge documentation. For questions or updates, please open an issue in the repository.*
