import nconf from 'nconf';

nconf
  .env()
  .file({ file: './config/config.json' });

nconf.defaults({
  NODE_ENV: 'development',
  REDIS_PORT_6379_TCP_ADDR: '127.0.0.1',
  redis: 'redis://redis:6379',
});
export default nconf;
