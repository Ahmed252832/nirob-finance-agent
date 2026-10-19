# Your own Nirob workspace — version 3.3

## Rename the bottom-left label

The earlier **MIST · Bangladesh** label came from the original competition team's details. It is no longer fixed in the application.

1. Open **Settings & data**, or click the name at the bottom left.
2. Register/unlock your own passkey.
3. Enter your name, team name or any workspace label up to 40 characters, then choose **Save name**.

The label is saved in this local installation. A new installation and a factory reset use **My workspace**. The product name remains Nirob.

## Start fresh

Settings offers two separate actions. Both show the exact deletion scope, require a typed confirmation and request fresh passkey verification. Neither action runs automatically on download.

| Action | Removed | Kept |
|---|---|---|
| Clear demo records | Accounts, transactions, bills, budgets, conversations, drafts, alerts, feedback/trust history, old audit entries and temporary uploaded files | Your workspace name and registered passkeys |
| Reset entire workspace | Everything listed above, plus the profile and app passkey registrations | Installed application, models, supporting runtime files and bundled synthetic test evidence |

After clearing records, unlock again and add sources under **Accounts**. After resetting the entire workspace, register your own passkey first. The cleared database stays empty after restarting; it does not silently restore the sample transactions.

No automatic backup is made by these actions. Separate backups, exported JSON, source packages, operating-system backups and credentials stored by Windows/your authenticator are outside this reset. Delete those separately if desired. The reset removes records from the active SQLite database and clears its journal; it is not a forensic disk wipe. Local service keys/runtime logs are installation support files and remain. Do not distribute an installation's `data/` folder.

If a chat or bill-reading job is active, wait for it to finish before resetting. Outstanding approval challenges and sessions are invalidated by a successful data replacement, preventing a stale approval from posting into the new workspace.

## Add your desired demo data

### Without editing files

1. Use **Accounts** to add your own friendly synthetic bank/cash/card sources and opening balances.
2. In **Settings & data**, use **Add your own demo income or spending**. Choose the source, income/expense, amount, category and date. Earlier dates allow you to build monthly history.
3. Use **Bills & approvals** to upload and review demo bills.
4. Start a new conversation to analyse the new records. Old replies are removed when you replace/reset the data.

These are simulated records. Do not enter actual account/card numbers, banking secrets or passkey material. A credit-card repayment workflow is not implemented; record income into a bank or cash source.

### Import a file

1. Select **Download example file** in Settings.
2. Edit its sample values. The file contains `accounts`, `transactions`, `bills`, `savingsGoalBDT` and `schemaVersion: 1`. Monetary values are BDT, not paisa.
3. Select the JSON file and click **Preview file**. Review account/transaction/bill counts, months and totals.
4. Choose **Review replacement**, type `REPLACE DEMO DATA`, and verify your passkey.

Import replaces the demo dataset and its old audit history while retaining your profile/passkeys. It never imports trust scores, approvals, conversations or credentials. The approval is bound to the previewed file content; a changed file must be reviewed and authorized again. Invalid references, dates, amounts, duplicate bill references and unexpected fields are rejected. Limits: 2 MB through the UI, 100 sources, 5,000 posted entries and 500 bills.

**Export active demo data** saves active sources, their posted entries, unpaid bills and the savings target. It intentionally excludes archived sources, chats, credentials, audit records and trust. This is a reusable demo dataset, not a complete private backup.

## The 100 automated reviews and the lower bound

**Safety & trust → Automated review evidence** displays the number passed, observed Wilson lower bound, required benchmark bound of 95%, and per-scope results. Results can be downloaded from that card. The review runner evaluates isolated synthetic cases and does not post money or write personal feedback.

The original 100-case run passed 90 cases: its lower bound was 82.56%. It exposed two failures: some “prepare bill” requests listed bills instead, and some incomplete transfers invented a recipient. The original report is retained. The corrected planner normalizes explicit known-bill preparation wording and requires an amount and recipient before inference; any model-proposed payment must match the explicit request.

The corrected run passed **100/100**, giving a measured Wilson lower bound of **96.30%** against the unchanged **95%** requirement. It includes 80 model-invoked cases, 10 pre-inference clarification checks and 10 pre-inference policy checks. The benchmark's measured bound changes with actual results; the requirement is not reduced to make failures pass. These related development cases are not an independent production-reliability sample. The individual task groups have smaller samples and lower bounds than the aggregate; the aggregate does not establish 95% reliability for every task.

Personal bill and transfer trust remain separate from automated evidence. The personal minimums remain 20/40/80 reviewed drafts with 80%/90%/95% lower bounds, respectively. Synthetic benchmark passes do not impersonate your reviews. Every final payment still requires a fresh transaction-bound passkey approval.

## Checks and limits

The reset/import integration is tested with signed software-authenticator assertions in a temporary workspace. It checks authorization, file binding, replacement, enrollment preservation/removal, stale challenges and an in-flight model reply. This does not constitute a physical fingerprint or rendered-browser test. The 100-scenario reports record which cases actually invoked the model and which were stopped by deterministic validation.
