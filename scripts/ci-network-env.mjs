import { networkInterfaces } from 'node:os';

const candidates = Object.entries(networkInterfaces()).flatMap(([name, addresses]) =>
  (addresses ?? [])
    .filter(
      (address) =>
        address.family === 'IPv4' && !address.internal && !/^(docker|br-|veth)/i.test(name),
    )
    .map((address) => ({ name, address: address.address })),
);

const selected = candidates[0];
if (!selected) throw new Error('No non-loopback IPv4 address is available for LAN E2E');

console.log(`NEXO_LAN_TEST_IP=${selected.address}`);
console.log(
  `NEXO_AUTH_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://${selected.address}:3000`,
);
console.log(`NEXO_PUBLIC_API_URL=http://${selected.address}:3001`);
console.log(`NEXO_PUBLIC_MEDIA_ORIGIN=http://${selected.address}:9000`);
