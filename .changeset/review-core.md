---
'@punica/form': patch
'@punica/form-service': patch
---

Fixes found by a review of 2.1:

- A subscriber that throws inside `batch` no longer stops every later notification of the form.
- A slow validation no longer writes its result onto a newer value, a newer validation of the same item, or a form that was reset in the meantime.
- Disabled items are not validated, like hidden ones: a disabled required field that is empty no longer blocks `Validate`.
