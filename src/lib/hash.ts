import { createHash } from "crypto";

const IP_HASH_SALT = process.env.IP_HASH_SALT || "shiplocal-salt-2026";

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${IP_HASH_SALT}:${ip}`)
    .digest("hex")
    .slice(0, 16);
}
