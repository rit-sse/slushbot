import events from './events';
import quotes, { handleQuoteResponse } from './quotes';
import memberships, { handleMembershipResponse } from './memberships';
import register from './helpers';
import nconf from '../config';

export default function registerNotifications(slushbot) {
  register(slushbot, 'events', events);
  register(slushbot, 'quotes', quotes);
  register(slushbot, 'memberships', memberships);
}

export function handleInteractiveMessages(controller) {
  controller.on('interactive_message_callback', (bot, message) => {
    console.log('A message for Michael Timbrook');
    console.log(`${nconf.get('SLACK_SLASH_TOKEN')} ${message.token}`);
    console.log(`${nconf.get('SLACK_TEAM')} ${message.team.domain}`);
    if (message.token === nconf.get('SLACK_SLASH_TOKEN') && message.team.domain === nconf.get('SLACK_TEAM')) {
      handleQuoteResponse(bot, message);
      handleMembershipResponse(bot, message);
    }
  });
}
