# Third-party components

Runtime sources and downloaded asset hashes are in `runtime-manifest.json`.

* Qwen2.5-1.5B-Instruct GGUF: Qwen project, Apache License 2.0; full upstream license in `licenses/Qwen-LICENSE.txt`.
* llama.cpp: ggml-org contributors, MIT; `licenses/llama.cpp-LICENSE.txt`. The Windows runtime also includes LLVM OpenMP's own license alongside its binary.
* Tesseract English language data: upstream Apache License 2.0; `licenses/tessdata-LICENSE.txt`.
* Tesseract.js, SimpleWebAuthn and transitive Node dependencies: versions in `package-lock.json`; their original license files remain in the complete package's `node_modules/` directories.
* Python PDF support uses PyMuPDF, installed separately, under its upstream AGPL/commercial licensing terms. See https://pymupdf.readthedocs.io/en/latest/about.html and its installed distribution license. It is not bundled as a Python binary here. Review applicable licensing before redistributing a modified deployment.

The app's source and evidence are supplied to the user for review. These notices do not claim ownership of third-party models, libraries or competition materials.

* Qwen3-4B GGUF Q4_K_M: official Qwen project, Apache License 2.0; pinned source and SHA-256 in `chat-model-manifest.json`, full upstream license in `licenses/Qwen3-LICENSE.txt`.
