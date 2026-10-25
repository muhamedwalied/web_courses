# Forms

- **A visible label for every control,** tied with `for`/`id` or wrapping. A placeholder shows an example (ending with «…» or "…"), and it is never the label (QA-08).
- **The right input:** `type` (`email`, `tel`, `url`, `number` only for real quantities), `inputmode`, `autocomplete` tokens, `spellcheck="false"` on codes and emails, `enterkeyhint`.
- **Direction:** email, URL, phone, code and password inputs are `dir="ltr"`; free text is `dir="auto"` (see `scripts-lang/bidi.md`).
- **Digits:** accept Arabic-Indic and Extended Arabic-Indic digits and normalise them before validation.
- **Validate on blur and on submit,** not on every keystroke. On submit, focus the first invalid field and announce a summary (`role="alert"` or an `aria-live` region).
- **Error text** under the field, in the page language: what is wrong and how to fix it. Tie it with `aria-describedby` and set `aria-invalid`.
- **Submit** stays enabled until the request starts. Then it becomes loading (with the same width) and cannot be sent twice. Idempotency keys are for the backend, but the UI must not double-send.
- **Never block paste.** Never clear the user's input on error.
- **Group related fields** with `<fieldset>` and `<legend>`. Mark optional fields, not required ones, when most fields are required.
- **Long forms:** save a draft (for example in `sessionStorage`), warn before leaving with unsaved changes, and show the steps with the current position.
- **Bot protection** (Turnstile, hCaptcha) never replaces validation, and its widget must respect the page language and theme.
- **Honesty:** a form without a backend does not ship (see `core/honesty.md`).
