# AutoProgressLog Version 2.0.0
This release is a major update that overhauls APL with structural improvements, feature additions, and quality-of-life fixes. 
It includes server-side authentification and tracking, UI enhancements, , bug fixes, and various build/compatibility fixes.

## 🚀 Key Enhancements

**Authentication system added (backend)**
Introduces a new auth system to support secure user login flows and session management. This means you can now generate reports automatically while the app is not running or if your computer is offline. Also, if you use multiple devices, your data will be stored in the cloud and accessible from any device.

**Frontend UI Improvements**
Reports now directly show up in the app with an option to optionally export or copy them, you no longer need to write them to a file.

**Improved Build & Storage Support**
Your local storage is now encrypted with your computer passkey, and your data is securely stored in the cloud. 

**Bug Fixes**
Many bugs have been fixed, including timezone issues and other persistent bugs.

## 🔧 Internal / Technical
Refactors across backend and frontend to harmonize the auth system with existing routes.
Removed outdated deploy workflow (.github/workflows/deploy.yml).
TypeScript import fixes, logging cleanup, initialization sequence adjustments.

## ❗ Breaking Changes
This release bumps the major version to 2.0.0.
You will be prompted with an update dialog if you are using an older version of the app.