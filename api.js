import API from 'sse-api-client';
import nconf from './config';

if (!nconf.get('SSE_API_ROOT') || !nconf.get('SLACK_SECRET')) {
  console.log('Warning: API_ROOT or SLACK_SECRET not set');
}

export default () => new API(nconf.get('SSE_API_ROOT'));
