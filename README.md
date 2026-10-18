# Nirob — earned-autonomy financial agent

English, local, single-user competition prototype. All accounts and payments are synthetic. Topic A: AI personal financial management. Version 3 replaces the earlier browser-only demo.

## Run on this Windows computer

1. Open `START_NIROB.cmd` in the complete application folder. Keep its window open.
2. Wait for the local model to load and the browser to open **http://localhost:4177**.
3. Select **Register your passkey**. Windows/browser may offer fingerprint, face or device PIN. Nirob does not receive biometric images. Configure Windows Hello if your computer has no platform authenticator.
4. Open **Agent**. Try `Review my spending and suggest a budget that saves 10000 taka`, `Pay my electricity bill`, or `Send 500 to Rahim`.
5. Review a draft in **Bills & approvals**, then approve the exact payment with your passkey. The server posts simulated money only after verification.
6. Upload `evidence/sample_bill.png` or `.pdf` to test bill extraction; inspect all fields before saving. Add cash spending under Activity.
7. In Safety, generate and block an unknown request. Approving a flagged request instead requires two distinct registered passkeys. Two credentials are not proof of two physical devices.

Requirements: Windows x64, Node.js 24+, modern Chrome/Edge with WebAuthn, sufficient RAM for the approximately 1.1 GB model, and Python with PyMuPDF for PDF extraction. Image OCR works through the bundled Node dependencies. For PDF support on another computer: `python -m pip install -r requirements.txt`. Initial dependency installation may need internet. Inference and the included English OCR data run locally. Ports 4177 and 8088 must be free.

The complete folder includes Node dependencies and model files, but not Node/Python themselves. The source ZIP and Git bundle omit runtime/dependencies; use `npm ci`, obtain the files listed in `runtime-manifest.json`, extract llama.cpp into `runtime/llama`, place the model at `runtime/model.gguf` and OCR data at `runtime/eng.traineddata.gz`, then run the launcher. Preserve the third-party license notices.

## What changed

* **Actual model-based agent:** local Qwen2.5-1.5B-Instruct through llama.cpp creates a bounded plan, invokes allowlisted tools, records outcomes and stops on a tool error. Grounded summaries explain what happened. It does not replan after failures and is not an unrestricted autonomous agent.
* **Budget suggestion:** recorded income, expenses, unpaid bills and a savings goal produce a spending limit, available discretionary amount, savings shortfall and deficit. A small skill-based income experiment is suggested without earnings promises.
* **Bill extraction:** English image OCR, PDF text extraction and scanned-PDF OCR with review before saving.
* **Verified approval:** WebAuthn signatures, user verification, transaction-bound expiring single-use challenges, server-side execution and SQLite ledger.
* **Trust:** accepted/rejected feedback on actual agent drafts feeds the Wilson lower bound. Test fixtures do not grant runtime trust. Trust permits preparation and scheduling, never execution.
* **Evidence:** automated tests, real-model evaluations, OCR fixtures, browser verification results and execution logs are included under `evidence/`.

## Data and safety

Use friendly synthetic account names, never actual bank/card details. Account-number entry cannot connect a bank or intercept a Visa transaction. Bank/PSP authorization and an approved integration are future work. No blockchain is used; there is no claim to Topic F on-chain compliance. Nothing has been published.

Data, credentials and audit/model secrets are created under `data/`. Do not share this folder. Close the launcher to stop services. To begin a new demo, stop the application and move the entire `data/` folder to a private backup; the next launch starts fresh and needs passkey registration. Never reset it while the server is running.

The prototype is deliberately local. Do not bind it to a public interface or deploy it unchanged to the internet. Production needs identity, account recovery, HTTPS, authorization, operational monitoring and independent security review.

## Verify and inspect

Run `RUN_TESTS.cmd` or `npm test`: 42 automated tests were passing at packaging. See `SECURITY.md`, `ARCHITECTURE.md`, `COMPETITION.md`, `EVALUATION.md` and `DEMO_SCRIPT.md` for boundaries and evidence. Browser tests use Chrome virtual authenticators; physical fingerprint hardware was not tested. Model evaluation contains 10 actual model tasks plus 2 policy refusals before inference. These are narrow checks, not broad reliability certification.

## Files

`server.mjs`: HTTP, sessions, approval and scheduler. `domain.mjs`/`logic.mjs`: ledger, Guardian, budgets and trust. `agent.mjs`: model planning and permitted tools. `store.mjs`: SQLite and HMAC audit. `ocr.mjs`/`pdf_extract.py`: extraction. `app.js`/`index.html`/`styles.css`: English UI. `start.mjs`: local model/application launcher. `tests/`: repeatable unit/API tests. `evidence/`: disclosed test records and samples.
