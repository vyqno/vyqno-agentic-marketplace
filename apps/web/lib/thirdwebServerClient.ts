import { createThirdwebClient } from "thirdweb";

// NOTE: NEXT_PUBLIC_ prefix is a naming mistake in .env — this value is never
// sent to the browser because it's only imported in server-only files.
// Rename to THIRDWEB_SECRET_KEY before production.
let _client: ReturnType<typeof createThirdwebClient> | null = null;

export function getThirdwebServerClient() {
  if (_client) return _client;
  const secretKey = process.env.NEXT_PUBLIC_THIRWEB_SECERT_KEY;
  if (!secretKey) throw new Error("Missing NEXT_PUBLIC_THIRWEB_SECERT_KEY");
  _client = createThirdwebClient({ secretKey });
  return _client;
}
