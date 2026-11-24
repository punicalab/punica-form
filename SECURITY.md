# Security

## Supported versions

| Version | Supported |
| ------- | --------- |
| 2.x     | Yes       |
| 1.x     | No        |

## Reporting a vulnerability

Please report it privately through GitHub: the repository's **Security** tab,
**Report a vulnerability**. Do not open a public issue.

Say which package and version, how to reproduce it, and what an attacker
gains. You will get an answer within a week, and a fix is released as a patch
before the report is made public.

One property is worth knowing when judging a report: a form definition written
as data (`@punica/form-json`) holds no code. Rules and conditions are named,
not written, so a definition from a source you do not trust cannot run
anything. Anything that makes one do so is in scope.
