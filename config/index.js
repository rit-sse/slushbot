import nconf from 'nconf';

nconf
  .env()
  .file({ file: './config/config.json' });

export default nconf;
