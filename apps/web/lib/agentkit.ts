// Creates a deterministic server wallet for an agent using thirdweb Engine REST API.
// The same label always returns the same wallet address (idempotent).
export async function createAgentWallet(agentName: string): Promise<string> {
  const secretKey = process.env.NEXT_PUBLIC_THIRWEB_SECERT_KEY;
  if (!secretKey) throw new Error("Missing NEXT_PUBLIC_THIRWEB_SECERT_KEY");

  const response = await fetch("https://api.thirdweb.com/v1/wallets/server", {
    method: "POST",
    headers: {
      "x-secret-key": secretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: `agentnet-${agentName}` }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`thirdweb server wallet creation failed: ${err}`);
  }

  const json = await response.json();
  // thirdweb returns: { result: { address: "0x..." } }
  const address = json?.result?.address ?? json?.address;
  if (!address) throw new Error(`Unexpected response shape: ${JSON.stringify(json)}`);
  return address;
}
