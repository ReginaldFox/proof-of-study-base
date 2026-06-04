# Base App Behavior

When opened inside Base App, the app can use the injected wallet provider.

The app checks for `window.ethereum` before attempting an automatic injected connection.
If a user disconnects, the app stores a local dismissal flag and does not reconnect automatically.

Users can always reopen the wallet dialog and choose a wallet manually.
