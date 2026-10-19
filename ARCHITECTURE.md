# Architecture and building guide

## Boundaries

Browser goal → local HTTP server → Qwen planner → schema/tool validation → permitted domain tools → observations and checked result → payment draft. The separate approval route binds a passkey challenge to that draft, rechecks Guardian rules and commits one ledger transaction. The model never receives an execution tool.

1. `npm ci` installs exact dependency versions from the lockfile.
2. Obtain the runtime assets and verify SHA-256 values in `runtime-manifest.json`.
3. `node start.mjs` starts a loopback-only model service with a generated API key, then the application.
4. `openStore()` creates a private demo database, audit secret and initial synthetic transactions.
5. Register a platform passkey. Store its public key and counter; the private key stays with the authenticator.
6. `modelPlan()` supplies tool descriptions and bill IDs to the local model. JSON output is constrained and checked; invalid plans fail closed.
7. `runAgent()` executes at most four permitted operations, captures observations and reports failures. Financial amounts are converted to integer minor units before domain operations.
8. Bill extraction never grants payment approval. Review the payee, amount, reference and due date, then save.
9. `auth/options` creates an unpredictable HMAC-derived challenge bound to the session, purpose, transaction digest and expiry. `auth/verify` consumes it once and verifies origin, RP ID, signature and user verification. It checks that the pending transaction still matches and re-runs the Guardian before posting.
10. The scheduler checks every minute while the server runs. Sufficient bill-specific user feedback can allow preparation of known upcoming bills; every execution still needs fresh verification.

## Secure execution pseudocode

```text
request_approval(session, draft):
  require authenticated(session)
  require draft.pending and guardian(draft).allowed
  binding = SHA256(canonical transaction fields)
  challenge = HMAC(server_secret, random_id + session + binding + expiry)
  save single_use(challenge, binding, expiry=now+120s)
  return WebAuthn options(userVerification=required)

verify_and_pay(session, signed_assertion):
  c = consume_once(session, challenge_id)
  require c.not_expired
  verify WebAuthn RP, origin, signature, credential, user verification
  require current_transaction_digest == c.binding
  require guardian(current_transaction).allowed
  if flagged: require two different verified credential IDs
  atomically: mark executed, post ledger row, mark bill paid, append audit
```

## Earned preparation autonomy

Each agent draft accepts one feedback outcome. Feedback refers to a recorded trace and uses the draft kind as its scope. Wilson confidence and minimum sample sizes determine the tier in `logic.mjs`; an unsafe outcome disables that scope's autonomy. The application starts without feedback. Synthetic benchmark results and virtual-authenticator QA do not populate this score. A single demo acceptance is process evidence, not evidence of reliable financial judgment. Repeated similar examples can bias the score; a representative supervised study is still required.

## Deployment

The submitted website is served locally at localhost:4177. It is not publicly hosted. A future hosted system needs HTTPS, verified user accounts, per-user isolation, secure recovery and enrollment, rate limits, secrets management, durable backups and permissioned bank/PSP adapters. A bank adapter would replace simulated posting only after separate authorization and end-to-end provider testing. Merely adding account numbers cannot supply transaction streams or card authorization control.

## Version 3.1 conversation flow

Authenticated chat → persistent conversation → exact payment-intent check → recorded financial context → local model response → escaped chat bubbles. Advice uses up to eight recorded months, keeps missing months unknown, and marks the current month partial. The latest six messages are supplied to the model with bounded lengths; this is not unlimited memory. A computed record summary remains inspectable beside the reply.

`POST /api/chat/new` creates a conversation; `POST /api/chat` accepts a message and an idempotency identifier. Messages and analysis traces live in the same SQLite state and HMAC audit as the ledger. Pending replies survive refresh; restart marks interrupted work for review. One generation runs at a time. This local prototype caps conversations at 50 and messages at 200 per conversation.

Only explicit payment commands enter the existing planner. Its proposed payee/amount or bill ID must match the parsed command. Advice and conversational confirmations do not grant payment authority. A payment reply links to the existing review and fresh passkey approval flow.

The launcher prefers the SHA-256-verified Qwen3-4B Q4_K_M asset in `chat-model-manifest.json`, with reasoning output disabled. It retains the older model as a fallback. Model output is constrained to a short structured reply, then rendered as ordinary paragraphs and lists. Internal model reasoning is not exposed.

## Version 3.2: synthetic history and coached responses

`demo-history.mjs` builds seven previous complete months in separate archived synthetic sources. The installation script backs up the local database and audit key, adds 77 labelled rows through the audited store mutation, and verifies existing credentials, bills, feedback, transactions and active balances are preserved. It is idempotent. It neither grants trust nor modifies the current seed's arithmetic.

Financial context reads up to eight recorded months, marks the current month partial, calculates completed-month averages and category changes, and provides those facts to the model. `coaching.mjs` selects one of eight versioned fictional examples for in-context guidance; example selection and the fact that weights are unchanged are recorded with the reply. `plan-checks.mjs` replaces model-supplied weekly step durations with computed minute allowances that sum to the latest stated limit. The model supplies the activities; arithmetic checks do not prove that an activity is feasible in its allotted time.

`trust-progress.mjs` exposes independent bill and transfer progress, minimum review/confidence thresholds and the number of additional correct reviews needed under a no-further-errors assumption. Incorrect and unsafe feedback are distinct; unsafe feedback still locks the scope. No data import or model evaluation populates actual user feedback.

## Version 3.3: workspace ownership and data lifecycle

`workspace-data.mjs` validates profile labels, explicitly synthetic dated bookkeeping entries and schemaVersion 1 JSON datasets. Imports whitelist fields, resolve account references, check dates and bounded integer amounts, and cannot inject credentials, trust or approvals. The preview returns counts/totals and a SHA-256 digest of the submitted dataset.

`manage-data` WebAuthn challenges bind a fresh user-verification step to a clear/factory/import purpose and, for imports, the preview digest. A short-lived, single-use session grant plus the exact confirmation phrase is required for the mutation. Active agent/OCR work blocks reset; a workspace epoch invalidates pre-reset verification requests, and reset clears sessions, pending challenges and approval progress.

The store replacement deletes old state/audit content with SQLite secure_delete enabled, starts a new audit chain, checkpoints and compacts the live database. Reset removes only the verified uploads location under the application data directory. This is an application-level deletion, not forensic erasure of disk history or external copies. Model/runtime files, service keys/logs and external backups remain. A factory reset removes profile/app credential records; a data-only reset/import retains them. Empty databases remain empty on restart.

The automated review report is static evidence, not an input to the personal trust engine. The planner now validates explicit payment fields before model inference, normalizes known-bill preparation wording, and checks any returned payment tool against the request. Policy validation and model-invoked cases are counted separately.
