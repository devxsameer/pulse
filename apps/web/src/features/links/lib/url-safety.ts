// Guards server-side fetches of user-supplied URLs (SSRF). Workers can't resolve DNS, so this
// checks the URL as written; Cloudflare's outbound fetch not reaching private networks is the backstop.

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".home.arpa",
  ".lan",
  ".intranet",
  ".corp",
];

// [network, prefix length] for every non-public IPv4 range (RFC 6890 and friends).
const BLOCKED_IPV4_RANGES: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

function ipv4ToInt(ip: string) {
  const match = IPV4_PATTERN.exec(ip);
  if (!match) return null;

  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return null;

  return octets.reduce((acc, octet) => acc * 256 + octet, 0);
}

function isBlockedIpv4(ip: number) {
  return BLOCKED_IPV4_RANGES.some(([network, prefix]) => {
    const size = 2 ** (32 - prefix);
    const start = ipv4ToInt(network)!;

    return ip >= start && ip < start + size;
  });
}

// Expands an IPv6 literal (already normalised by the URL parser) to eight 16-bit groups.
function parseIpv6(ip: string) {
  const [head = "", tail] = ip.split("::");
  const parse = (part: string) =>
    part ? part.split(":").map((group) => Number.parseInt(group, 16)) : [];

  const headGroups = parse(head);
  const tailGroups = tail === undefined ? [] : parse(tail);
  const missing = 8 - headGroups.length - tailGroups.length;

  if (tail === undefined ? missing !== 0 : missing < 0) return null;

  const groups = [
    ...headGroups,
    ...Array<number>(Math.max(missing, 0)).fill(0),
    ...tailGroups,
  ];

  return groups.every((group) => Number.isInteger(group) && group <= 0xffff)
    ? groups
    : null;
}

// Allow only global unicast (2000::/3) minus ranges that tunnel to or document other networks.
// This rejects loopback, unspecified, IPv4-mapped/NAT64, unique-local, link-local, and multicast.
function isBlockedIpv6(groups: Array<number>) {
  const [first = 0, second = 0] = groups;

  if ((first & 0xe000) !== 0x2000) return true;
  if (first === 0x2001 && second === 0x0db8) return true; // documentation
  if (first === 0x2001 && second === 0x0000) return true; // Teredo
  if (first === 0x2002) return true; // 6to4

  return false;
}

export function isFetchableUrl(url: URL, blockedHosts: Array<string> = []) {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.port !== "") return false;
  if (url.username || url.password) return false;

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (hostname.startsWith("[")) {
    const groups = parseIpv6(hostname.slice(1, -1));
    return groups !== null && !isBlockedIpv6(groups);
  }

  // The URL parser already canonicalises decimal, hex, and octal IPv4 forms to dotted quads.
  const ipv4 = ipv4ToInt(hostname);
  if (ipv4 !== null) return !isBlockedIpv4(ipv4);

  if (!hostname.includes(".")) return false;
  if (hostname === "localhost") return false;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return false;
  }

  return !blockedHosts.some(
    (blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`),
  );
}
