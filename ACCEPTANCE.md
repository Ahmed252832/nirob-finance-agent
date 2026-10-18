# Twenty acceptance checks

These checks summarize the expanded test suite and recorded workflows. They are not a claim of production certification. Details and actual results are in `tests/` and `evidence/`.

1. BDT inputs convert to exact minor units; invalid values are rejected.
2. Transfers cannot exceed available bank funds.
3. Linked debit spending reduces its bank's available balance.
4. Credit spending respects the demo credit limit.
5. A paid bill or duplicate pending bill cannot be submitted again.
6. Unknown recipients generate a review signal.
7. Blocking an unknown request prevents its execution.
8. The local model produces an allowlisted plan for selected goals.
9. Disallowed tool names are rejected; execution is absent from the tool list.
10. Agent observations show success or failure and stop after an error.
11. English sample PNG/PDF extraction yields payee, amount, reference and date.
12. Extracted fields remain reviewable before bill creation.
13. Budget scenarios preserve nonnegative savings/discretionary amounts and expose deficits.
14. Manual cash expenditure appears in monthly records.
15. WebAuthn registration and payment assertions verify at the server.
16. A replayed approval is rejected.
17. A flagged request needs a second distinct credential.
18. Feedback is deduplicated and the Wilson score is scoped; fixture scores do not grant live trust.
19. Audit edits are detected and writes are locked; local-owner limitations are disclosed.
20. Missing CSRF, cross-origin and locked-session writes are rejected; private server files are not served.

Hardware fingerprint behavior, genuine independent-device ownership, multilingual/noisy OCR, representative human financial-advice ratings and live bank settlement are still unverified. The packaged application starts at zero runtime feedback.
