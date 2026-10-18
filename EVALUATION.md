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
