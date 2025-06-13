// import { systemPreferences } from "electron";
// import keytar from "keytar";

// const SERVICE = "MyElectronApp"; // you can choose any unique service name
// const ACCOUNT = "user-auth-token"; // name for this particular credential entry

// /**
//  * Store a token securely in the OS vault.
//  * On macOS/Windows this will trigger the first biometric prompt
//  * (Touch ID or Windows Hello), then respect the system’s lock policies.
//  *
//  * @param {string} token — The token (e.g. JWT) you want to save.
//  * @returns {Promise<void>}
//  */
// export async function storeToken(token: string) {
//   try {
//     await keytar.setPassword(SERVICE, ACCOUNT, token);
//     console.log("Token stored successfully");
//   } catch (err) {
//     console.error("Failed to store token:", err);
//     throw err;
//   }
// }

// /**
//  * Retrieve the previously stored token.
//  * If the vault is locked (per OS policy), this will prompt the user again.
//  *
//  * @returns {Promise<string|null>} — The token string, or null if not found.
//  */
// export async function fetchToken() {
//   try {
//     const token = await keytar.getPassword(SERVICE, ACCOUNT);
//     if (token === null) {
//       console.warn("No token found in secure vault");
//     }
//     return token;
//   } catch (err) {
//     console.error("Failed to fetch token:", err);
//     throw err;
//   }
// }
