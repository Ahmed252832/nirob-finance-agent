# Evaluation report — 18 October 2026

| Evidence | Result | Interpretation |
|---|---|---|
| Automated domain/core/HTTP tests | 42 passed, 0 failed | Checks arithmetic, Guardian, trust, storage and request boundaries |
| Real local Qwen planning | 10/10 selected goals passed expected tool/value checks | Small handpicked English set, no generalization claim |
| Policy refusals | 2/2 blocked before inference | Deterministic refusal tests, not neural-model successes |
| Budget scenarios | 4/4 invariants passed | Normal cash flow, no income, overspending, unaffordable savings |
| OCR sample image and text PDF | 2/2 extracted four fields correctly | Same clean English synthetic bill in two formats; not a diverse OCR benchmark |
| Browser WebAuthn flow | Passed | Real server crypto with virtual authenticators; no physical fingerprint test |
| Supervised trust | Actual feedback recorded during demo | Mechanism evidence only; not established model reliability |

See the raw JSON files for exact goals, model replies, amounts and observations. Model used: Qwen2.5-1.5B-Instruct GGUF Q4_K_M, local llama.cpp CPU, temperature 0, seed 42. Financial recommendations are grounded in deterministic calculations; the small model plans the workflow. No financial-adviser expert or target-user study has rated advice usefulness. Income ideas are experiments, not earnings guarantees.

Before claiming dependable earned autonomy, collect consented, representative user decisions on real agent drafts across income levels, bill formats and ambiguous goals. Keep development cases separate from held-out evaluation, report rejected drafts and severe errors, and inspect calibration by task scope. Do not turn the included fixtures into runtime trust points.

Known gaps: Bengali/handwritten bills, noisy OCR, incomplete cash records, model ambiguity, robust recovery, accessibility/hardware matrix, production concurrency and bank settlement are not validated. A proposed budget uses recorded monthly commitments and may omit future essentials not entered by the user.

## Chat upgrade — 19 October 2026

Version 3.1: **58 automated tests passed, 0 failed**. The additional tests cover persistent conversations, idempotency, isolation, unavailable history, bounded month comparisons, interrupted replies, escaping, payment intent, authenticated endpoints and UI state transitions. `evidence/chat-tests.txt` contains the run. DOM harness tests do not validate rendered layout.

The official Qwen3-4B Q4_K_M model was installed and its SHA-256 verified against the pinned upstream asset. Three consecutive real-model turns asked for a business idea, supplied maths skills with 5 hours/week and a BDT 3,000 ceiling, then asked for a first-week plan. Response times were 42.9 seconds, 36.9 seconds, 50.5 seconds. The reply disclosed missing historical months, proposed a conditional service, moved to maths revision sessions, and gave a 1+1+2+1 hour weekly plan. Raw replies and context are in `evidence/chat-model-evaluation.json`. A subsequent display-only normalization removes model-supplied duplicate list numbering.

This small development conversation is not independent evidence of broad intelligence or financial-advice quality. The model still gives basic suggestions and can overemphasize templates/spreadsheets. It does not reliably restate every constraint, verify market demand, assess professional qualifications, browse current facts or guarantee feasibility. Recent conversation context is bounded. Larger and more diverse held-out cases, user reviews and expert evaluation remain future work.

`evidence/chat-api-check.json` records a separate integration run using real cryptographic verification with a synthetic software authenticator in an isolated database. It checks local-model chat, persistence, duplicate handling, exact transfer preparation without posting, fresh signed execution approval, hidden locked-session conversations and JavaScript serving. It is not a physical fingerprint or browser interaction test.

Automatic approval review rejected headless browser launches for this update. No new rendered-browser or hardware verification is claimed. Earlier browser evidence and the presentation/video apply to the earlier workspace. Existing user credentials and transactions were compared with a private pre-upgrade backup after restart and were unchanged; the audit verification passed.

## Version 3.2 — history, coaching and trust

- **67 automated tests passed, 0 failed.** Added coverage for seven-month installation, idempotency/year boundaries, preservation of balances and credentials, no synthetic trust credit, eight-month context, coaching selection, revised time constraints, independent trust scopes, error recovery counts, unsafe locks, contradictory feedback and calculated time allocations. UI state tests cover the history summary and scope-specific progress. See `evidence/history-coaching-tests.txt`.
- Installed 77 labelled synthetic records for March–September 2026 through an audited mutation, with private backup and unchanged active balances, credentials, existing transactions, bills and feedback. Audit verification passed. Public installation evidence and monthly totals are included separately.
- Added eight curated in-context coaching examples and a JSONL starter dataset. The model weights are unchanged; no training job or adapter was produced. No dataset or private financial record was uploaded.
- Ran four live-model development questions. Initial keyword checks passed but manual inspection caught a 3.5-hour plan against a three-hour limit and an insufficiently qualified partial-month comparison. The raw initial answers and failure notes are preserved in `evidence/coaching-evaluation-initial.json`.
- The revised run supplied computed completed-month category changes and checked weekly allocations. All four focused checks passed; timings were 81.7s, 78.3s, 96.1s, 16.4s. The weekly reply totalled 180 minutes. See `evidence/coaching-evaluation.json` for the full answers and manual review. This is a small development set, not an independent quality benchmark; financial judgment, market demand and feasibility still need user/expert review.
- No new rendered-browser or physical-authenticator testing was performed. Existing approval safeguards remain covered by the automated suite; the previous signed-authenticator integration evidence is retained. Earlier videos and slides show earlier app versions.
