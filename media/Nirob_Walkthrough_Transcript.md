# Nirob 3.3 — step-by-step walkthrough

Updated 20 October 2026. Actual isolated application recording, virtual WebAuthn authenticator, synthetic money and Microsoft Zira synthetic English narration. Model waiting time is shortened. Setup/title/end screens are instruction cards. No personal workspace was reset.

## 00:00 — Nirob 3.3

This walkthrough shows Nirob version three point three, a local personal finance prototype. All balances and payments are synthetic. The recording uses a separate demo workspace and a virtual passkey. Your saved personal workspace is untouched. Model waiting time is shortened in the edited footage.

## 00:21 — Open the Windows app

Open the complete Nirob Agent folder and double click START NIROB dot cmd. Keep the launcher window open. Wait for the browser to open localhost, port four one seven seven. The full folder needs Node twenty four or later. A source ZIP also needs its dependencies and model files. PDF reading needs Python and the listed requirements.

## 00:46 — Register your passkey

Choose Register your passkey. On your computer, the browser and Windows may offer fingerprint, face, or device PIN. Nirob receives a signed response, never a biometric image. This recording uses a virtual authenticator, so it does not show a physical fingerprint prompt. On later visits, choose Unlock with passkey.

## 01:11 — Ask in ordinary language

Open Agent workspace and type your question into the chat box. Here, we ask for a business idea based on recorded spending, with maths tutoring skills, three hours a week, and a two thousand taka ceiling. The local Qwen three, four billion parameter model produces a reply. Read its assumptions and check suggestions before acting.

## 01:36 — Check the records used

Expand Financial context used beneath the reply. This demo contains seven complete synthetic months, March through September, plus the current month so far. Check income, spending, and net recorded cash flow. Missing cash purchases or future commitments can change the picture. The current partial month is not a complete month for comparison.

## 02:01 — Keep the conversation going

Ask a follow-up in the same conversation. Here, we request a first-week plan within three hours. Nirob uses recent messages and recorded financial context. This is in-context coaching, not a newly trained model. Check that the suggested activities fit your own skills and situation; an idea is not a promise of income.

## 02:25 — Suggest a budget

Open Budget and advisor. Enter a savings goal and your skills, then request a budget. The app calculates from recorded income, expenses and unpaid bills. Review any shortfall before saving. A saved budget is a plan for the demo; it does not move money or guarantee that unrecorded costs have been covered.

## 02:49 — Upload a bill

Open Bills and approvals and upload the included sample bill image. The app extracts readable fields. Check the payee, amount, reference and due date before saving. English image OCR and PDF extraction are supported, but recognition can fail. The clean sample used here does not establish accuracy on handwriting, Bengali bills or noisy photographs.

## 03:15 — Prepare a payment

Start a chat and ask, Send five hundred to Rahim. The app prepares a draft for review. An explicit amount and recipient are required; incomplete requests should ask for clarification. The AI has no payment execution tool. A known saved bill can also be requested by name, such as Pay my electricity bill.

## 03:40 — Review, then approve

Open Bills and approvals. Compare the draft with your request. Correct, incorrect, and unsafe draft feedback is separate from payment approval. Choose Review and approve, inspect the exact amount and recipient, then Verify passkey and pay. The server verifies a fresh challenge bound to this transaction before posting the simulated payment to Activity.

## 04:05 — Add cash spending

Open Activity and enter a cash purchase with its description, amount and category. This makes the purchase available to the monthly calculations. These are manually entered demo records. Nirob does not automatically receive real card transactions or intercept a Visa request simply because an account or card is listed in the app.

## 04:28 — Review unknown requests

In Safety and trust, generate an unknown demo request. Inspect the alert and choose Block request. This demonstrates the app holding and blocking a simulated request. It does not monitor a real bank account. Flagged approvals require two distinct registered passkeys, which do not necessarily mean two different physical devices.

## 04:52 — Understand the evidence

The automated review card shows one hundred passing development scenarios and a Wilson lower bound of ninety six point three percent, against the unchanged ninety five percent requirement. Eighty cases invoked the model; twenty checked clarification or policy before inference. Personal bill and transfer trust are separate. Automated results never grant your personal trust or bypass final approval.

## 05:20 — Make the workspace yours

Open Settings and data, or click the bottom-left name. Replace My workspace with your own label and choose Save name. The previous fixed MIST label has been removed from the product. The new name is saved for this local installation. The application itself is still called Nirob.

## 05:40 — Create your own records

In Settings and data, choose income or spending, select an active demo account, and enter the amount, description, category and date. Earlier dates let you create your own monthly history. If the workspace is empty, add a synthetic source under Accounts first. These entries are bookkeeping records, not live banking transactions.

## 06:04 — Import a custom demo

Download the example JSON file and edit its sample accounts, transactions and bills. Select your file and preview the counts, months and totals. Review replacement, type REPLACE DEMO DATA, and verify your passkey. Import replaces the dataset and resets personal trust while keeping your name and passkey registration. Unlock again after replacement.

## 06:32 — Erase and start again

Clear demo records keeps your workspace name and passkey, while removing financial records, chats, feedback and old audit history. Reset entire workspace also removes the profile and app passkey registrations. Each action needs its exact confirmation phrase and fresh passkey approval. Separate exports, backups and authenticator-held passkeys remain. The reset shown here affects only our recording workspace.

## 07:02 — Ready for your next demo

You can now name the workspace, add your own demo data, chat about goals, prepare payments and review the evidence. Every final payment still requires approval. The current prototype has no bank connection. Keep private data folders out of shared source packages. Close the launcher when you finish using the local app.

## Related materials

Use the latest README and PERSONAL_WORKSPACE.md in the app folder. Fresh installs can choose their own name and demo data. Source packages exclude model runtime and private data.
