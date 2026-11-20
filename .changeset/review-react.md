---
'@punica/form-react': patch
---

`useFormController` keeps the form it started first when its effect runs again (StrictMode, a hidden `<Activity>` shown again, Fast Refresh) instead of replacing it with a new, empty one. An entity factory that throws, and a failure without a reason, now arrive in `error`.
