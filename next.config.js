/**
 * @type {import('next').NextConfig}
 **/
 const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  distDir: '.next',
  images: {
    domains: [
      'proton.bloks.io',
      'wax.bloks.io',
      'bloks.io',
      'facings.mypinata.cloud',
      'robohash.org',
      'ipfs.ledgerwise.io',
      'gateway.pinata.cloud',
      'ipfs.io',
      'proton.mypinata.cloud',
      'protonscan.io',
      'www.protonscan.io',
      'ipfs.glbdex.com',
      'api.multiavatar.com',
      'api.dicebear.com',
      'avatars.dicebear.com',
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;