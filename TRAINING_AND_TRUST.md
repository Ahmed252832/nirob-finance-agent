# Demo history, improving answers and earned trust

## Seven previous months

The installed dataset covers March–September 2026: 77 explicitly synthetic records, with income, rent, groceries, utilities, transport, dining, subscriptions, education, health and shopping. Income varies, dining increases and one month includes a health-cost spike. These patterns are invented for demonstration; they are not inferred facts about you.

The records use separate archived demo bank/cash sources, so your existing active balances, credentials, bills and trust feedback stay unchanged. Open **Activity** for the seven-month summary. Start a **new chat** and ask “Review my previous seven months.” Old replies remain historical snapshots. Chat now reads up to eight recorded months: seven previous months plus the current partial month.

Installation is repeatable without duplicates: `node scripts/install_demo_history.mjs`. It makes a private database/audit-key backup first. On a freshly reset demo, it chooses the seven months immediately before the current month. Do not share the private backup or `data/`.

## What was done to improve the model

Eight curated examples in `coaching.mjs` teach response patterns for business ideas, maths tutoring, design services, week plans, spending reviews, deficits, missing history and payment approval. The server selects one relevant example and includes it in the model's prompt. The model then generates a response from current records and recent conversation. This is **in-context learning/coaching**, not weight training. The Qwen model file remains unchanged.

The starter examples are also exported as `training/coaching-seed.jsonl`. They are assistant-authored synthetic examples, not user-reviewed financial training data. Eight examples are not enough to establish reliable financial advice. Live-model results are in `evidence/coaching-evaluation.json`; tests and user trust are separate.

This computer currently has integrated AMD graphics, a quantized GGUF inference runtime and no installed PyTorch/Transformers/PEFT training stack. I have not run a weight-training job or created a LoRA adapter. A future LoRA job can train small adapter matrices while keeping the original base weights frozen; it needs a compatible training model, training environment and evaluated dataset. See [Hugging Face's official LoRA explanation](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora). No cloud service was provisioned and no financial data was uploaded.

## Practical ideas for further coaching and training

1. **Create examples from real shortcomings.** Record the question, the financial facts available at that time, the unsatisfactory answer, a corrected answer, and why it is better. Remove personal identifiers. Never turn an unreviewed model answer into a “correct” label automatically.
2. **Cover different circumstances.** Variable income, missing salary, family obligations, debt payments, unexpected health costs, subscriptions, student schedules, no startup budget, skills the user does not have, and changes to the user's stated constraints.
3. **Teach honest uncertainty.** Missing months are unknown. A partial month cannot establish a full-month improvement. Cash not recorded can change the picture. Spending habits do not establish skills or business demand.
4. **Teach actionable business answers.** Name a service/product, explain which stated skill supports it, fit the available time and spending ceiling, propose a small demand test, and ask one useful question. Include cases where the right answer is to avoid upfront spending.
5. **Teach clarification and security.** Ambiguous recipients, duplicate invoices, changed amounts, suspicious uploaded instructions and requests to skip approval. The server's approval checks must remain outside the model.
6. **Keep evaluation separate.** Reserve different scenarios and conversations for evaluation before editing prompts/examples. Do not put the evaluated answers into the coaching bank and still describe them as held out. Score numerical accuracy, grounded claims, constraints, usefulness, unsafe advice and payment-boundary compliance separately.
7. **Review and version.** Have intended users and a qualified finance reviewer check the examples. Track corrections and compare a candidate against the previous version. Start with a modest set of varied, carefully reviewed examples; increase coverage where actual failures occur. More repeated easy examples do not establish reliability.
8. **Choose the appropriate mechanism.** Use live ledger calculations for amounts, conversation context for preferences, curated examples for answer style, and consider weight fine-tuning only after a consistent failure pattern remains. Refreshing account history should not require model retraining.

To change the local coaching bank, edit a relevant example in `coaching.mjs`, restart the launcher, run `npm test`, then run `evaluation/evaluate_coaching.mjs` with the local model key configured as in the launcher. Keep the key private. The script does not change user feedback or grant trust. For a future training run, use the JSONL as a starting format, collect a separate reviewed dataset, and keep training/evaluation splits by scenario or conversation to reduce leakage.

## How to increase trust correctly

1. Ask the agent to prepare a real demo task, for example **“Pay my electricity bill”** or **“Send 500 to Rahim.”**
2. Open **Bills & approvals** and compare its draft with your actual request or reviewed bill. Check the recipient, amount, reference and due date.
3. Rate it **Correct draft**, **Incorrect draft**, or **Unsafe draft**. Each actual agent draft counts once. Payment is not required to rate a draft; rating never authorizes payment. Review before discarding or paying, because this UI shows feedback buttons on pending drafts.
4. Use varied tasks across time. Repeatedly generating the same easy draft just to raise the score produces a misleading score. Review failures honestly and correct the cause.

| Tier | Minimum reviews in that scope | Required Wilson lower bound |
|---|---:|---:|
| 0 | Below the thresholds, or an unsafe review | — |
| 1 | 20 | 80% |
| 2 | 40 | 90% |
| 3 | 80 | 95% |

Both the minimum count and confidence condition must pass. With every draft correct, 20/20, 40/40 and 80/80 meet their corresponding thresholds. Errors can lower a tier and require additional correct reviews. For example, 20 correct out of 21 falls below tier 1; four further correct reviews bring 24/25 above its confidence threshold. The app shows the current calculation rather than a guaranteed countdown.

**Bills and transfers have separate trust.** Reviewing transfers does not raise bill-scheduler trust. In the current implementation, tier 1 bill trust enables the scheduler to prepare known unpaid bills due within ten days while the server runs. Tiers 2 and 3 indicate more evidence but currently unlock no additional execution power. Transfers remain prepared on explicit request. All final payments require fresh transaction-bound passkey approval, at every tier.

**Incorrect** reduces measured reliability. **Unsafe** locks that scope at level 0 and discards its pending scheduler drafts. This prototype has no automatic recovery/reset from unsafe feedback: investigate the failure and define a separate supervised reevaluation before designing recovery. Existing unsafe ratings are preserved; no historical rating was silently reclassified.

Dummy transactions, model examples, automated tests, chat messages, approvals and simply using the app do **not** add trust points. This is supervised preparation evidence within a demo, not proof of production banking reliability.

Version 3.3 separately displays the 100-case automated review result (100/100; aggregate Wilson lower bound 96.30%, required 95%). This development benchmark does not raise your personal trust score. See `PERSONAL_WORKSPACE.md` for the result, editable workspace name and ways to clear/import your own demo data. Clearing or replacing demo data also clears personal feedback/trust.

## What the live evaluation taught us

The first evaluation exposed a 3.5-hour plan for a 3-hour request and an insufficiently qualified suggestion to compare a partial month with completed months. Those failures are retained in `evidence/coaching-evaluation-initial.json`. The update supplies calculated completed-month category changes and adds checked weekly minute allocations; it does not pretend the original response passed. A time allowance is a planning constraint, not proof that the proposed activity can be completed in that time. Review scope and feasibility yourself.

Coaching and longer history add processing time. The UI shows a waiting indicator; avoid resending a message while its reply is being prepared.

Use `training/review-template.json` to collect a question, its factual context, a corrected answer and reviewer checks. It starts unreviewed and unassigned. Do not mark it reviewed until someone has checked it, and do not put test scenarios into the coaching or training split.
