---
'@punica/form-kit': patch
---

`bindForm` of `@punica/form-kit/dom` no longer checks a field when it is left. The error line that check drew (or took away) moved the submit button between the press and the release of the click that left the field, so the first click on the button was lost. Now a field is checked as it is changed while it shows an error (the error goes as soon as it is put right), and every change checks its field once a submit was tried; before that, a new error waits for the submit. `reset: true` starts that over.
