import {
  buildGoogleAuthUrl,
  getOAuthCallbackUrl,
  getGoogleOAuthClientId,
  getGoogleOAuthClientSecret,
  GoogleOAuthState,
  DEFAULT_GOOGLE_CLIENT_ID,
} from "../lib/googleOAuth";

async function runGoogleAuthTests() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Google OAuth Unit Tests");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Client ID and Secret Retrieval
  console.log("\n[1] Testing Client ID & Secret Retrieval");
  const resolvedClientId = getGoogleOAuthClientId();
  assert(typeof resolvedClientId === "string" && resolvedClientId.length > 0, "Client ID resolves to a valid string");
  assert(resolvedClientId.endsWith(".apps.googleusercontent.com"), "Client ID ends with .apps.googleusercontent.com");

  // 2. Test Auth URL Generation for Creator
  console.log("\n[2] Testing Google Auth URL Generation (Creator)");
  const creatorState: GoogleOAuthState = {
    role: "CREATOR",
    action: "login",
    timestamp: Date.now(),
  };
  const creatorUrlStr = buildGoogleAuthUrl(
    resolvedClientId,
    "http://localhost:3000/api/auth/google/callback",
    creatorState
  );
  const creatorUrl = new URL(creatorUrlStr);
  assert(creatorUrl.origin === "https://accounts.google.com", "Target is accounts.google.com");
  assert(creatorUrl.pathname === "/o/oauth2/v2/auth", "Path is /o/oauth2/v2/auth");
  assert(creatorUrl.searchParams.get("client_id") === resolvedClientId, "Client ID matches");
  assert(creatorUrl.searchParams.get("redirect_uri") === "http://localhost:3000/api/auth/google/callback", "Redirect URI matches");
  assert(creatorUrl.searchParams.get("response_type") === "code", "Response type is code");
  assert(creatorUrl.searchParams.get("scope") === "openid email profile", "Scopes contain openid, email, profile");
  assert(creatorUrl.searchParams.get("prompt") === "select_account", "Prompt is select_account");

  // Verify State decoding
  const stateRaw = creatorUrl.searchParams.get("state");
  assert(!!stateRaw, "State token exists");
  const decodedState = JSON.parse(Buffer.from(stateRaw!, "base64url").toString("utf-8"));
  assert(decodedState.role === "CREATOR", "State retains role 'CREATOR'");
  assert(decodedState.action === "login", "State retains action 'login'");

  // 3. Test Auth URL Generation for Business Signup
  console.log("\n[3] Testing Google Auth URL Generation (Business Signup)");
  const businessState: GoogleOAuthState = {
    role: "BUSINESS",
    action: "signup",
    timestamp: Date.now(),
  };
  const businessUrlStr = buildGoogleAuthUrl(
    resolvedClientId,
    "http://localhost:3000/api/auth/google/callback",
    businessState
  );
  const businessUrl = new URL(businessUrlStr);
  const businessStateRaw = businessUrl.searchParams.get("state");
  const decodedBusinessState = JSON.parse(Buffer.from(businessStateRaw!, "base64url").toString("utf-8"));
  assert(decodedBusinessState.role === "BUSINESS", "State retains role 'BUSINESS'");
  assert(decodedBusinessState.action === "signup", "State retains action 'signup'");

  // 4. Test Dynamic Callback URL Generation from Request
  console.log("\n[4] Testing Callback URL Construction from Request Headers");
  const mockReq = new Request("http://localhost:3000/api/auth/google", {
    headers: {
      host: "localhost:3000",
    },
  });
  const callbackUrl = getOAuthCallbackUrl(mockReq);
  assert(callbackUrl === "http://localhost:3000/api/auth/google/callback", "Dynamic localhost callback URL is correct");

  const mockForwardedReq = new Request("http://localhost:3000/api/auth/google", {
    headers: {
      "x-forwarded-host": "trustscore.io",
      "x-forwarded-proto": "https",
    },
  });
  const prodCallbackUrl = getOAuthCallbackUrl(mockForwardedReq);
  assert(prodCallbackUrl === "https://trustscore.io/api/auth/google/callback", "Forwarded HTTPS production callback URL is correct");

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runGoogleAuthTests();
