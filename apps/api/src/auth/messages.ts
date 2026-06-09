export function buildAuthMessage(params: {
  domain: string;
  walletAddress: string;
  nonce: string;
  issuedAt: string;
}) {
  return [
    "SYNORA Authentication",
    "",
    `Domain: ${params.domain}`,
    `Wallet: ${params.walletAddress}`,
    `Nonce: ${params.nonce}`,
    `Issued At: ${params.issuedAt}`,
    "",
    "Sign this message to authenticate with SYNORA.",
    "This request will not trigger a blockchain transaction or cost gas."
  ].join("\n");
}