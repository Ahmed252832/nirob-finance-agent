# Set up a cloned Nirob project on Windows

The repository contains source and media. A clone does not contain the multi-gigabyte local models, installed dependencies or another person's data. Each installation creates its own workspace and passkeys.

## 1. Clone and install dependencies

Install Git and Node.js 24 or later. For PDF bill support, also install Python and ensure it is available as `python`.

```powershell
git clone https://github.com/Ahmed252832/nirob-finance-agent.git
cd nirob-finance-agent
npm ci
python -m pip install -r requirements.txt
```

The Python command is for PDF support. This public repository can be cloned without an invitation. Dependency installation and runtime downloads require internet; the configured model runs locally.

## 2. Obtain and verify the runtime

Use the exact URLs and SHA-256 hashes in these files:

- [`runtime-manifest.json`](../runtime-manifest.json): Windows llama.cpp CPU archive, fallback model and English OCR data.
- [`chat-model-manifest.json`](../chat-model-manifest.json): the current Qwen3-4B Q4_K_M chat model.

Before using each downloaded file, run `Get-FileHash -Algorithm SHA256 <downloaded-file>` and compare the full result with its manifest. Do not accept a mismatch. Extract the llama.cpp archive, keeping the executable and its DLLs together.

Arrange the resulting files inside the project:

```text
runtime/
  llama/
    llama-server.exe
    ... DLLs and license files from the archive
  chat-model.gguf          # current Qwen3-4B model
  model.gguf               # Qwen2.5 fallback; optional with chat model present
  eng.traineddata.gz       # included English OCR data
```

The current chat model is about 2.5 GB. The app README recommends 16 GB system RAM. Preserve the third-party license files. The manifests identify the files used in the recorded evaluation; this repository does not redistribute model binaries.

## 3. Run and verify

```powershell
npm test
```

Then double-click `START_NIROB.cmd`. Keep its window open while using the application. Wait for `http://localhost:4177`. Ports 4177 and 8088 must be available.

Choose **Register your passkey** on the first launch. The device may offer fingerprint, face or device PIN. Nirob never collects biometric images. No account or key belonging to the original developer is needed.

## 4. Personalize the demo

Open **Settings & data** to choose your name, enter synthetic records, or preview/import your own JSON. Data replacement requires typed confirmation and fresh passkey approval. See [`PERSONAL_WORKSPACE.md`](../PERSONAL_WORKSPACE.md).

To add seven prior complete synthetic months using the included helper, stop the application first and run:

```powershell
node scripts/install_demo_history.mjs
```

The helper dates history relative to the current Dhaka date and prints the private backup location it creates. It is idempotent and does not grant personal trust. The recorded October 2026 demo used March–September history; a later installation will use different months. Never commit its private backup.

## Included media and boundaries

The [`media`](../media) folder contains the updated demo, tutorial, deck, subtitles and transcripts. The short demo uses a virtual authenticator and edited model waits. All financial records and payments are synthetic. No bank connection or Visa interception is implemented.

Do not upload `data/`, `.env`, service keys, browser profiles or backups. Stop the launcher to shut down the app. This local prototype should not be exposed publicly as a banking service.
