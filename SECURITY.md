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

## Chat addition, 19 October 2026

Conversation history is withheld from unauthenticated sessions. Chat mutations require the existing authenticated session, CSRF and origin checks. Response formatting escapes HTML before applying a limited set of formatting rules; it does not execute model HTML or links. Conversation text and financial context remain in the local application/model services. The SQLite database, audit logs and private backups may contain conversation content; protect them and never package `data/`.

Prompt instructions can influence advice, so answers are not a security boundary or a certified financial recommendation. Neither chat text nor model output can approve payment. Explicit payment preparation additionally checks the planner against the requested recipient and amount/bill. Every final simulated execution still requires the separate verified, transaction-bound passkey challenge and Guardian checks. Retries reuse stored message results; an app restart does not automatically retry a payment draft.

## Version 3.2

Synthetic archived history is labelled at row, dataset and UI levels. Installation validates unchanged current balances and sensitive state and records an audit event. It does not connect accounts, authorize transactions or change existing feedback. The new feedback validation rejects non-boolean and contradictory accepted/unsafe values. Separate incorrect/unsafe controls explain the unsafe lock; prior unsafe ratings are retained.

The model's curated examples are static application code, not executable tools. They never authorize a payment. Example-inspired text can still be incorrect; explicit missing-data labels, computed financial facts and bounded weekly time allocations improve specific failure modes without constituting a general safety proof. Model weights and all passkey execution checks are unchanged.

## Version 3.3 reset and import controls

Profile/data mutation requires the existing authenticated session, same-origin and CSRF checks. Destructive replacement additionally requires a fresh signed WebAuthn assertion for the exact mode and file digest, a short-lived one-use grant, and a matching typed confirmation. Imported files cannot supply profile credentials, approval state or trust feedback. Changes to the approved file are rejected.

Resets block while model/OCR work is pending, invalidate outstanding sessions/challenges, and reject verification continuations from an earlier workspace epoch. Test evidence uses isolated temporary databases and signed software-authenticator assertions. The production user's current data is not cleared by installation of this feature.

Reset clears active database records, old audit content and temporary uploaded files. It does not claim to erase exported files, backups, OS history, hardware/authenticator credentials or all SSD remnants. No reset auto-backup is created. Installed models, service keys/logs and bundled synthetic review evidence are retained. Share distributable packages without the personal data directory.

The original 100-scenario review exposed missing-recipient invention in the legacy agent route. Explicit transfer amount/recipient validation now runs before inference, and all model payment plans are checked against authorized request fields. The model still never receives an execution tool.
