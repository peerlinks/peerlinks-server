'use strict';

import fs from 'fs';
import http from 'http';
import yargs from 'yargs';
import micro from 'micro';

const argv = yargs
  .alias('c', 'config')
  .demandOption([ 'config' ])
  .argv;

import createService from '../lib/service';

async function main(configFile) {
  const rawConfig = fs.readFileSync(argv.config + '').toString();
  const config = {
    port: 3000,
    host: '127.0.0.1',
    ...JSON.parse(rawConfig),
  };

  const service = await createService(config);

  const server = micro(service);

  server.listen(config.port, config.host, () => {
    console.error('Listening on %j', server.address());
  });
}

main().catch((e) => {
  console.error(e.stack);
  process.exit(1);
});
