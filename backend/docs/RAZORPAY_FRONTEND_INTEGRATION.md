# Razorpay Frontend Integration Guide

This guide explains how to integrate Razorpay checkout into the **`apps/web`** Next.js frontend, and documents the backend payment/order APIs (including the bug fixes that were applied on the backend side).

> ⚠️ All steps below are **frontend changes you need to make**. The backend changes described in the [Backend changes already applied](#backend-changes-already-applied) section are already done.

---

## Table of contents

1. [How the payment flow works](#how-the-payment-flow-works)
2. [Backend changes already applied](#backend-changes-already-applied)
3. [Step 1 — Environment variables](#step-1--environment-variables)
4. [Step 2 — Load the Razorpay checkout script](#step-2--load-the-razorpay-checkout-script)
5. [Step 3 — Add payment endpoints to api-constants](#step-3--add-payment-endpoints-to-api-constants)
6. [Step 4 — Create the payment service](#step-4--create-the-payment-service)
7. [Step 5 — Fix the order service types](#step-5--fix-the-order-service-types)
8. [Step 6 — Wire the booking page to Razorpay](#step-6--wire-the-booking-page-to-razorpay)
9. [Postman: full API reference & JSON](#postman-full-api-reference--json)

---

## How the payment flow works

```
┌──────────┐     1. POST /api/orders/            ┌──────────┐
│          │ ──────────────────────────────────> │          │
│          │     { package, start_date }         │          │
│          │ <────────────────────────────────── │          │
│          │     Order { id, total_amount,... }  │          │
│          │                                      │          │
│ Frontend │     2. POST /api/payments/create-order/  Django │
│  (web)   │ ──────────────────────────────────> │  + DRF   │
│          │     { order_id }                    │          │
│          │ <────────────────────────────────── │          │
│          │     { razorpay_key_id,              │          │
│          │       razorpay_order_id, amount }   │          │
│          │                                      │          │
│          │     3. Razorpay Checkout opens (browser SDK)    │
│          │        user pays → Razorpay returns:            │
│          │        razorpay_payment_id,                     │
│          │        razorpay_order_id,                       │
│          │        razorpay_signature                       │
│          │                                      │          │
│          │     4. POST /api/payments/verify/   │          │
│          │ ──────────────────────────────────> │          │
│          │     { razorpay_order_id,            │          │
│          │       razorpay_payment_id,          │          │
│          │       razorpay_signature }          │          │
│          │ <────────────────────────────────── │          │
│          │     { message: "Payment successful",│          │
│          │       order_id }                    │          │
└──────────┘                                      └──────────┘
```

**The golden rule:** the order is only marked `PAID` *after* the backend verifies the
signature in step 4. Never trust the browser's "payment success" callback alone — the
signature verification on the server is the source of truth.

### Sequence in plain words

1. **Create the booking (Order).** When the user submits the booking form, call
   `POST /api/orders/` with `package` + `start_date`. The backend sets `total_amount`
   from the package price and returns an `Order` with `status: "PENDING"`.
2. **Create the Razorpay order.** Call `POST /api/payments/create-order/` with the
   Django `order_id`. The backend creates (or reuses) a Razorpay order and returns
   `razorpay_key_id`, `razorpay_order_id`, `amount` (in **paise**), and `currency`.
3. **Open Razorpay Checkout** in the browser with those values. The user pays.
   On success, Razorpay's handler gives you `razorpay_payment_id`,
   `razorpay_order_id`, and `razorpay_signature`.
4. **Verify on the backend.** Call `POST /api/payments/verify/` with those three
   values. The backend verifies the signature, marks the order `PAID`, and creates a
   `Payment` record. Show success to the user only after this returns `200`.

---

## Backend changes already applied

These were fixed on the backend so the frontend integration works correctly. You do
**not** need to do anything for these — they are listed so you understand the contract.

| # | Bug | Fix |
|---|-----|-----|
| 1 | `Order` model had **no `start_date`** field, but the booking form sends one. | Added `start_date = DateField(null=True, blank=True)` + migration `orders/0002_order_start_date`. |
| 2 | `OrderSerializer` didn't expose `package_name` (frontend used it). | Added read-only `package_name` (from `package.name`). |
| 3 | `RazorpayService()` was built as a **class attribute** → app crashed at import if keys were missing/invalid. | Made it a lazy `@property`. |
| 4 | `create-order` created a **new Razorpay order on every retry**, orphaning the old one, and didn't return the key id. | Reuses an existing Razorpay order when amount matches; now returns `razorpay_key_id`. |
| 5 | `verify` had **no transaction / no idempotency** → a replayed request could create duplicate `Payment` rows and a race could double-process. | Wrapped in `transaction.atomic()` + `select_for_update()`, scoped to the requesting user, and made idempotent (already-paid order → no-op). |

> **Status naming note for the frontend:** after a successful payment the order status
> becomes **`"PAID"`** (not `"CONFIRMED"`). The valid order statuses are:
> `"PENDING" | "PAID" | "CANCELLED" | "COMPLETED"`. Update your TypeScript types
> accordingly (see [Step 5](#step-5--fix-the-order-service-types)).

---

## Step 1 — Environment variables

Create / update `apps/web/.env.local`:

```bash
# Base URL of the Django API (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Razorpay PUBLIC key id (the "rzp_test_..." / "rzp_live_..." key).
# This is the KEY ID only — NEVER put the key SECRET in the frontend.
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

> The backend also returns `razorpay_key_id` in the `create-order` response, so you can
> use that instead of the env var if you prefer a single source of truth. The env var is
> a convenient fallback. **Only the key SECRET is sensitive — keep it backend-only.**

---

## Step 2 — Load the Razorpay checkout script

Razorpay's browser SDK is loaded from their CDN: `https://checkout.razorpay.com/v1/checkout.js`.

**Option A (recommended) — load globally in `apps/web/src/app/layout.tsx`** using Next's `Script`:

```tsx
// apps/web/src/app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
```

**Option B — load on demand** (only on the booking page). Add this helper and call it
right before opening checkout:

```ts
// apps/web/src/lib/razorpay.ts
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    // Already loaded
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
```

Either way, you'll access the SDK via the global `window.Razorpay`.

Add a TypeScript declaration so `window.Razorpay` type-checks:

```ts
// apps/web/src/types/razorpay.d.ts
interface RazorpayOptions {
  key: string;
  amount: number;       // in paise
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;     // razorpay_order_id
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
```

---

## Step 3 — Add payment endpoints to api-constants

In `apps/web/src/lib/api-constants.ts`, extend `API_ENDPOINTS`:

```ts
export const API_ENDPOINTS = {
  AUTH: { /* ...unchanged... */ },
  LOCATIONS: "/locations",
  PACKAGES: "/packages",
  ORDERS: "/orders",
  PAYMENTS: {
    CREATE_ORDER: "/payments/create-order/",
    VERIFY: "/payments/verify/",
    HISTORY: "/payments/history/",
  },
};
```

> Note the trailing slashes — Django's `APPEND_SLASH` + DRF router expect them, and the
> custom actions are registered as `create-order`, `verify`, `history`.

---

## Step 4 — Create the payment service

Create `apps/web/src/services/payment.service.ts`:

```ts
import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-constants";

// Response from POST /api/payments/create-order/
export interface CreateRazorpayOrderResponse {
  razorpay_key_id: string;
  razorpay_order_id: string;
  amount: number;     // in paise
  currency: string;   // "INR"
  order_id: number;   // the Django order id
}

// What Razorpay's checkout handler returns
export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  message: string;
  order_id: number;
}

async function parse(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const paymentService = {
  // Step 2 — ask the backend to create/reuse a Razorpay order for a Django order
  async createRazorpayOrder(orderId: number): Promise<CreateRazorpayOrderResponse> {
    const res = await fetchWithAuth(API_ENDPOINTS.PAYMENTS.CREATE_ORDER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await parse(res);
    if (!res.ok) {
      throw new Error(data.error || data.detail || "Failed to start payment");
    }
    return data as CreateRazorpayOrderResponse;
  },

  // Step 4 — verify the signature on the backend
  async verifyPayment(payload: RazorpayHandlerResponse): Promise<VerifyPaymentResponse> {
    const res = await fetchWithAuth(API_ENDPOINTS.PAYMENTS.VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parse(res);
    if (!res.ok) {
      throw new Error(data.error || data.detail || "Payment verification failed");
    }
    return data as VerifyPaymentResponse;
  },

  // Optional — payment history for the logged-in user
  async getHistory(): Promise<any[]> {
    const res = await fetchWithAuth(API_ENDPOINTS.PAYMENTS.HISTORY, { method: "GET" });
    const data = await parse(res);
    if (!res.ok) throw new Error(data.error || data.detail || "Failed to load history");
    return data as any[];
  },
};
```

---

## Step 5 — Fix the order service types

The current `apps/web/src/services/order.service.ts` has a few mismatches with the
backend. Update it to match the real API:

```ts
import { fetchWithAuth } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-constants";

export interface CreateOrderPayload {
  package: number;
  start_date: string; // "YYYY-MM-DD"
}

export interface Order {
  id: number;                 // was string — backend returns a numeric id
  package: number;
  package_name: string;       // added on the backend serializer
  total_amount: string;
  // backend uses PAID, not CONFIRMED:
  status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
  razorpay_order_id: string | null;
  start_date: string | null;
  created_at: string;
  updated_at: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await fetchWithAuth(API_ENDPOINTS.ORDERS + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data: any;
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) throw new Error(data.detail || data.error || data.message || "Failed to create booking");
    return data as Order;
  },

  async listMine(): Promise<Order[]> {
    const res = await fetchWithAuth(API_ENDPOINTS.ORDERS + "/my/", { method: "GET" });
    let data: any;
    try { data = await res.json(); } catch { data = []; }
    if (!res.ok) throw new Error(data.detail || data.error || "Failed to load orders");
    return data as Order[];
  },
};
```

Key changes:
- `id` is a **number**, not a string.
- `status` includes **`"PAID"`** (the value the backend sets after payment) — there is
  no `"CONFIRMED"` status in the backend.
- Added `package_name`, `razorpay_order_id`, `start_date`, `updated_at`.

---

## Step 6 — Wire the booking page to Razorpay

In `apps/web/src/app/book/[id]/page.tsx`, the current `handleSubmit` ends right after
`orderService.createOrder(...)` and immediately shows success. Replace that tail with
the full payment flow. Conceptually:

```tsx
import { paymentService } from "@/services/payment.service";
import { loadRazorpayScript } from "@/lib/razorpay"; // if using Option B in Step 2

// ...inside the component...

const startRazorpayPayment = (
  order: Order,
  rzp: CreateRazorpayOrderResponse,
) => {
  return new Promise<void>((resolve, reject) => {
    const options: RazorpayOptions = {
      key: rzp.razorpay_key_id,            // or RAZORPAY_KEY_ID env var
      amount: rzp.amount,                  // paise, from the backend
      currency: rzp.currency,              // "INR"
      name: "Muay Thai Fight Camps",
      description: pkg?.title ?? "Fight Camp Booking",
      order_id: rzp.razorpay_order_id,
      prefill: {
        name: fullName,
        email: user?.email,
        contact: phone,
      },
      notes: { django_order_id: String(order.id) },
      theme: { color: "#ff5a1f" },         // match your brand
      handler: async (resp) => {
        try {
          await paymentService.verifyPayment({
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_signature: resp.razorpay_signature,
          });
          resolve(); // verified on the backend → safe to show success
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    };

    const instance = new window.Razorpay(options);
    instance.on("payment.failed", (resp: any) => {
      reject(new Error(resp?.error?.description || "Payment failed"));
    });
    instance.open();
  });
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate() || !pkg) return;

  setSubmitting(true);
  setSubmitError(null);
  try {
    // 1. Save profile changes (unchanged)
    await userService.updateProfile({ /* ...as before... */ });

    // 2. Create the Django order (PENDING)
    const order = await orderService.createOrder({
      package: pkg.id,
      start_date: startDate,
    });

    // 3. Make sure the SDK is present (Option B only)
    const ok = await loadRazorpayScript();
    if (!ok) throw new Error("Could not load payment gateway. Check your connection.");

    // 4. Create the Razorpay order on the backend
    const rzp = await paymentService.createRazorpayOrder(order.id);

    // 5. Open checkout and wait for verified success
    await startRazorpayPayment(order, rzp);

    // 6. Verified → show success
    setSuccess(true);
    setTimeout(() => router.push("/profile"), 2500);
  } catch (err: any) {
    setSubmitError(err?.message || "Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
};
```

### Important UX / correctness notes

- **Only show "Booking Confirmed" after `verifyPayment` succeeds.** If the user closes
  the Razorpay modal (`ondismiss`) or payment fails (`payment.failed`), the order stays
  `PENDING` in the backend — surface an error and let them retry. Retrying calls
  `create-order` again, which **reuses** the existing Razorpay order (backend fix #4).
- **Don't double-charge.** Because the backend reuses the Razorpay order and the
  `verify` endpoint is idempotent, retrying after a dismissed modal is safe.
- The amount shown in checkout comes from the backend (`rzp.amount`, in paise). Never
  compute the amount on the client — it's derived from the package price server-side.
- The button label can change to "Proceed to Payment" since payment now happens inline.

---

## Postman: full API reference & JSON

Base URL: `http://localhost:8000/api` (adjust to your deployment).

All authenticated requests need:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

Get the token from `POST /api/auth/login/` (or Google login).

---

### 1. Create an Order — `POST /api/orders/`

**Auth:** required (user)

**Request body:**
```json
{
  "package": 1,
  "start_date": "2026-07-15"
}
```

**Success `201 Created`:**
```json
{
  "id": 12,
  "package": 1,
  "package_name": "Beginner Bootcamp",
  "package_details": {
    "id": 1,
    "name": "Beginner Bootcamp",
    "type": "BEGINNER",
    "description": "Intro camp",
    "price": "25000.00",
    "duration_days": 7,
    "location": 1,
    "is_active": true
  },
  "user_email": "user@example.com",
  "total_amount": "25000.00",
  "start_date": "2026-07-15",
  "status": "PENDING",
  "razorpay_order_id": null,
  "created_at": "2026-06-22T10:00:00Z",
  "updated_at": "2026-06-22T10:00:00Z"
}
```

> `total_amount` is set by the backend from the package price — anything you send for it
> is ignored (it's read-only).

---

### 2. List my Orders — `GET /api/orders/my/`

**Auth:** required (user). Returns only the caller's orders.

**Success `200 OK`:**
```json
[
  {
    "id": 12,
    "package": 1,
    "package_name": "Beginner Bootcamp",
    "total_amount": "25000.00",
    "start_date": "2026-07-15",
    "status": "PAID",
    "razorpay_order_id": "order_NabC123Xyz",
    "created_at": "2026-06-22T10:00:00Z",
    "updated_at": "2026-06-22T10:05:00Z"
  }
]
```

---

### 3. Cancel an Order — `POST /api/orders/{id}/cancel/`

**Auth:** required (user). Only works while the order is `PENDING`.

**Request body:** _(none)_

**Success `200 OK`:** the updated order with `"status": "CANCELLED"`.

**Error `400`** (if not pending):
```json
{ "error": "Cannot cancel order with status: PAID" }
```

---

### 4. Create Razorpay Order — `POST /api/payments/create-order/`

**Auth:** required (user). Order must belong to the caller and be `PENDING`.

**Request body:**
```json
{
  "order_id": 12
}
```

**Success `200 OK`:**
```json
{
  "razorpay_key_id": "rzp_test_xxxxxxxxxxxxx",
  "razorpay_order_id": "order_NabC123Xyz",
  "amount": 2500000,
  "currency": "INR",
  "order_id": 12
}
```

> `amount` is in **paise** (₹25,000 → `2500000`). Pass it straight to the Razorpay
> checkout `amount` option — do not multiply again.

**Error `404`** (order not found / not yours):
```json
{ "error": "Order not found" }
```

**Error `400`** (order not pending):
```json
{ "error": "Order is not in pending status" }
```

---

### 5. Verify Payment — `POST /api/payments/verify/`

**Auth:** required (user).

**Request body** (these three come from Razorpay's `handler` callback):
```json
{
  "razorpay_order_id": "order_NabC123Xyz",
  "razorpay_payment_id": "pay_NabD456Pqr",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Success `200 OK`:**
```json
{
  "message": "Payment successful",
  "order_id": 12
}
```

**Already verified (idempotent replay) `200 OK`:**
```json
{
  "message": "Payment already verified",
  "order_id": 12
}
```

**Error `400`** (bad/forged signature):
```json
{ "error": "Signature verification failed" }
```

**Error `404`** (no order for that razorpay_order_id, or not yours):
```json
{ "error": "Order not found for given razorpay_order_id" }
```

---

### 6. Payment History — `GET /api/payments/history/`

**Auth:** required (user). Returns the caller's payments.

**Success `200 OK`:**
```json
[
  {
    "id": 5,
    "order": 12,
    "razorpay_payment_id": "pay_NabD456Pqr",
    "razorpay_order_id": "order_NabC123Xyz",
    "razorpay_signature": "9ef4dffb...949a3d",
    "amount": "25000.00",
    "status": "SUCCESS",
    "method": null,
    "created_at": "2026-06-22T10:05:00Z",
    "updated_at": "2026-06-22T10:05:00Z"
  }
]
```

---

### Postman environment variables (suggested)

| Variable     | Example value                  |
|--------------|--------------------------------|
| `base_url`   | `http://localhost:8000/api`    |
| `token`      | _(paste access token here)_    |
| `order_id`   | `12`                           |
| `rzp_order`  | `order_NabC123Xyz`             |

Set a collection-level header `Authorization: Bearer {{token}}` so every request is
authenticated.

---

### End-to-end test order (Postman → Razorpay test mode)

1. `POST {{base_url}}/auth/login/` → copy `access` into `{{token}}`.
2. `POST {{base_url}}/orders/` with `{ "package": 1, "start_date": "2026-07-15" }`
   → save the returned `id` into `{{order_id}}`.
3. `POST {{base_url}}/payments/create-order/` with `{ "order_id": {{order_id}} }`
   → save `razorpay_order_id` into `{{rzp_order}}`.
4. **Pay in the browser** (Postman can't run the Razorpay checkout UI). Use the
   frontend or a test HTML page with Razorpay's test card
   (`4111 1111 1111 1111`, any future expiry, any CVV/OTP). Razorpay returns
   `razorpay_payment_id` + `razorpay_signature`.
5. `POST {{base_url}}/payments/verify/` with the three razorpay values
   → expect `{ "message": "Payment successful" }`.
6. `GET {{base_url}}/orders/my/` → the order is now `"status": "PAID"`.

> You cannot fully complete a real signature flow from Postman alone, because the
> signature is produced by Razorpay's hosted checkout after a real test payment. Steps
> 1–3 and 5–6 are Postman-testable; step 4 needs the browser SDK.
