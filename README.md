# Nirob — earned-autonomy financial agent

English, local, single-user competition prototype. All accounts and payments are synthetic. Topic A: AI personal financial management. Version 3.3 adds a personal workspace name, safe reset/import controls and measured automated review evidence.

## Run on this Windows computer

1. Open `START_NIROB.cmd` in the complete application folder. Keep its window open.
2. Wait for the local model to load and the browser to open **http://localhost:4177**.
3. Select **Register your passkey**. Windows/browser may offer fingerprint, face or device PIN. Nirob does not receive biometric images. Configure Windows Hello if your computer has no platform authenticator.
4. Open **Agent** to chat with Nirob. Start with `Suggest a small business idea based on my recorded spending`, then share your skills, time and budget. Follow up in the same conversation. You can also try `Review my spending and suggest a budget that saves 10000 taka`, `Pay my electricity bill`, or `Send 500 to Rahim`.
5. Review a draft in **Bills & approvals**, then approve the exact payment with your passkey. The server posts simulated money only after verification.
6. Upload `evidence/sample_bill.png` or `.pdf` to test bill extraction; inspect all fields before saving. Add cash spending under Activity.
7. In Safety, generate and block an unknown request. Approving a flagged request instead requires two distinct registered passkeys. Two credentials are not proof of two physical devices.

Requirements: Windows x64, Node.js 24+, modern Chrome/Edge with WebAuthn, sufficient RAM for the approximately 2.5 GB chat model (16 GB system RAM recommended), and Python with PyMuPDF for PDF extraction. Image OCR works through the bundled Node dependencies. For PDF support on another computer: `python -m pip install -r requirements.txt`. Initial dependency installation may need internet. Inference and the included English OCR data run locally. Ports 4177 and 8088 must be free.

The complete folder includes Node dependencies and model files, but not Node/Python themselves. The source ZIP and Git bundle omit runtime/dependencies; use `npm ci`, obtain the files listed in `runtime-manifest.json`, extract llama.cpp into `runtime/llama`, place the original model at `runtime/model.gguf`; for the improved chat model, obtain and verify `chat-model-manifest.json` and place it at `runtime/chat-model.gguf` and OCR data at `runtime/eng.traineddata.gz`, then run the launcher. Preserve the third-party license notices.

## What changed

* **Actual model-based agent:** local Qwen3-4B through llama.cpp (Qwen2.5-1.5B fallback if the chat model is absent) creates a bounded plan, invokes allowlisted tools, records outcomes and stops on a tool error. Grounded summaries explain what happened. It does not replan after failures and is not an unrestricted autonomous agent.
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

Run `RUN_TESTS.cmd` or `npm test`: 76 automated tests were passing at packaging. See `SECURITY.md`, `ARCHITECTURE.md`, `COMPETITION.md`, `EVALUATION.md` and `DEMO_SCRIPT.md` for boundaries and evidence. Browser recordings use a virtual authenticator; physical fingerprint hardware was not tested. The latest 100-case development review includes 80 model-invoked cases and 20 pre-inference clarification/policy checks. These selected cases are not broad reliability certification.

## Files

`server.mjs`: HTTP, sessions, approval and scheduler. `domain.mjs`/`logic.mjs`: ledger, Guardian, budgets and trust. `agent.mjs`: model planning and permitted tools. `chat.mjs`: persistent conversations, recorded history and model replies. `chat-format.mjs`: escaped chat formatting. `store.mjs`: SQLite and HMAC audit. `ocr.mjs`/`pdf_extract.py`: extraction. `app.js`/`index.html`/`styles.css`: English UI. `start.mjs`: local model/application launcher. `tests/`: repeatable unit/API tests. `evidence/`: disclosed test records and samples.

## Chat workspace

See `CHAT_UPGRADE.md` for usage and limits. The version 3.3 videos/deck were updated on 20 October 2026 and show the current chat and Settings workspace. The execution demo is about 2:37, the tutorial 7:26, and the 12-slide deck has about 9:25 of planned speaking time. Videos use actual isolated app interactions, synthetic money, a virtual authenticator, English synthetic narration and edited model waits. Earlier planning results apply to their recorded model, not automatically to the current one.

## History, coaching and trust

Open **Activity** for the March–September 2026 synthetic history. Start a new chat to analyse it; old replies remain snapshots. Open **Safety & trust** for each scope’s level and review requirements. See `TRAINING_AND_TRUST.md` for honest review steps, training ideas and the distinction between in-context coaching and weight training. The model weights have not been retrained.

## Personalize, reset and import

Open **Settings & data** to rename the bottom-left label, add your own dated demo income/spending, preview/import a custom JSON file, clear demo records or reset the entire workspace. Data replacement requires an explicit confirmation and fresh passkey verification. It does not delete your separate exports/backups or authenticator-held passkeys. Read `PERSONAL_WORKSPACE.md` for precise behavior.

Safety shows the automated 100-scenario review separately from personal earned trust, with the measured and required confidence bounds. The original failing run is preserved alongside the corrected run. Model/deterministic-validation counts are disclosed; passing these selected cases is not production reliability.

When sharing with another person, use the source package plus its documented runtime dependencies, or copy the application **without `data/` or private backups**. Each installation creates its own local data and passkeys. Never include your enrolled credentials or audit/model keys in a download for another user. The supplied source ZIP and Git bundle exclude these files.
