import { networkInterfaces } from 'node:os';

export function localIpv4Address() {
  const configured = process.env.NEXO_LAN_TEST_IP?.trim();
  if (configured) return configured;
  for (const [name, addresses] of Object.entries(networkInterfaces())) {
    if (/^(docker|br-|veth)/i.test(name)) continue;
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) return address.address;
    }
  }
  throw new Error('No non-loopback IPv4 address is available for the LAN test');
}
