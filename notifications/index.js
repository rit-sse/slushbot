import events from './events';
import quotes, { handleQuoteResponse } from './quotes';
import memberships, { handleMembershipResponse } from './memberships';
import register from './helpers';

export default function registerNotifications(slushbot) {
  register(slushbot, 'events', events);
  register(slushbot, 'quotes', quotes);
  register(slushbot, 'memberships', memberships);
}

export function handleInteractiveMessages(controller) {
  controller.on('interactive_message_callback', (bot, message) => {
    if (message.token === nconf.get('SLACK_SLASH_TOKEN') && message.team_domain === nconf.get('SLACK_TEAM')) {
      handleQuoteResponse(bot, message);
      handleMembershipResponse(bot, message);
    }
  });
}
