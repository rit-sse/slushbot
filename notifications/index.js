import events from './events';
import quotes from './quotes';
import memberships from './memberships';
import register from './helpers';

export default function registerNotifications(slushbot) {
  register(slushbot, 'events', events);
  register(slushbot, 'quotes', quotes);
  register(slushbot, 'memberships', memberships);
}
