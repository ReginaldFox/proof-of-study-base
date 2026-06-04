# Security Notes

- Private keys must stay out of the repository.
- GitHub and Vercel tokens should be rotated after operational use.
- The app does not request token purchases.
- Contract writes are limited to the daily check-in action.
- Wallet selection stays user-driven outside the Base App injected context.
