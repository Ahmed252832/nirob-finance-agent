# Security self-assessment

Scope: local synthetic single-user prototype, not a banking service. No biometric image, fingerprint template, card number, CVV or bank password is collected.

| Threat | Implemented control | Remaining limit |
|---|---|---|
| Model requests unauthorized payment | No execution tool; schema validation; Guardian and separate passkey route | Model may misunderstand a payee or amount; exact review is required |
| Prompt injection in goal or bill | Restricted tools; bill text is extracted data; suspicious instructions flagged | Pattern detection is not complete; no guarantee against all injections |
| Forged or replayed approval | WebAuthn signature/origin/RP/UV validation; 120-second consumed challenge | Physical hardware and recovery flows not independently tested |
| Transaction changed after approval | Challenge bound to transaction digest; current state and guard checked again | User must review the app display; WebAuthn authenticator UI itself may not display amount |
| Double spending | Pending-state check and transactional server mutation | Only local SQLite prototype tested; no provider settlement |
| Cross-site request | SameSite HttpOnly cookie, CSRF token, Origin and Host checks | Localhost HTTP only; not ready for public hosting |
| Unknown merchant/payee | Review alert and two distinct passkeys before execution; block action | Synced credentials do not prove independent devices; no issuer fraud feed |
| Audit edits | Server HMAC chain; invalid chain locks writes | Machine owner can replace key/database; valid-prefix truncation lacks external anchoring |
| Stolen browser session | Every payment needs a fresh verified assertion | Session can still change non-payment demo data; no production identity management |
| Malicious upload | Size/page limits, temporary file cleanup and review | Native PDF/OCR parsers remain an attack surface; no sandboxed worker service |
| Trust gaming | One outcome per actual agent draft; scope separation; unsafe outcome disables autonomy | User feedback can be biased; Wilson assumes meaningful samples |

The first local passkey enrollment is a bootstrap assumption: the legitimate user controls the machine. Existing-key proof is required for additional enrollment. Public read state contains synthetic financial data; do not use real financial data in this prototype. Local administrative compromise is outside its protection boundary. No security certification is claimed.

Authentication requests use user verification, not fingerprint-specific proof. Windows Hello or another authenticator may use face or PIN. Requiring only a fingerprint would not be a portable WebAuthn guarantee. The app's intended policy is user-verified final authorization with device-PIN fallback; earned autonomy cannot bypass it.

The browser test verified actual cryptographic WebAuthn responses from virtual CTAP2 authenticators. It tested registration, payment posting, replay rejection, feedback deduplication, and a second distinct credential for a risky request. This is implementation evidence, not evidence that a human pressed a physical fingerprint reader.
