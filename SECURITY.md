# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of the Team Dark Devil platform very seriously. If you discover a security vulnerability, please report it responsibly:

- **Email**: security@teamdarkdevil.internal (or open a confidential security advisory on GitHub).
- Please do not disclose security issues publicly until they have been patched and verified.

## Secure Configuration Practices
- Never commit `.env` or production credentials (`DATABASE_URL`, `R2_SECRET_ACCESS_KEY`, etc.) to version control.
- Ensure all API routes validate session credentials and role permissions.
