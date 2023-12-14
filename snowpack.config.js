// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    /* ... */
    src: '/',
    resources: '/resources',
    // style: '/src/style/style.css'
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
    source:"remote",
  },
  devOptions: {
    /* ... */
    port: 6001,
  },
  buildOptions: {
    /* ... */
  },
};
