export function formatUsd(amount: number): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 4,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(4)}`;
  }
}

export function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function truncateJson(raw: string, maxLen: number): string {
  if (raw.length <= maxLen) return raw;
  return raw.slice(0, maxLen - 1) + "…";
}
