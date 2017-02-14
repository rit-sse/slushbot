import Botkit from 'botkit';
import redisStore from 'botkit-storage-redis';
import Matchers from './matcher-register';
import setupMatchers from './matchers';
import registerNotifications, { handleInteractiveMessages } from './notifications';
import nconf from './config';

if (!nconf.get('SLACK_CLIENT_ID') || !nconf.get('SLACK_CLIENT_SECRET') ||  !nconf.get('SLACK_SLASH_TOKEN')) {
  throw new Error('Error: Specify slack tokens in environment');
}

const controller = Botkit.slackbot({
  debug: false,
  storage: redisStore({ url: nconf.get('redis') }),
});

controller.configureSlackApp({
  clientId: nconf.get('SLACK_CLIENT_ID'),
  clientSecret: nconf.get('SLACK_CLIENT_SECRET'),
  redirectUri: 'https://b4c0d65c.ngrok.io/oauth',
  scopes: [
    'commands',
    'bot',
    'team:read',
    'users:read',
    'channels:read',
    'groups:read',
    'im:read',
    'im:write',
    'chat:write:bot',
  ],
});

setupMatchers();

const bots = {};
function trackBot(bot) {
  bots[bot.config.token] = bot;
}

controller.on('create_bot', slushbot => {
  if (bots[slushbot.config.token]) {
    // already online! do nothing.
  } else {

    slushbot.startRTM((err, bot) => {
      if (err) {
        throw new Error(err);
      }
      registerNotifications(bot);
      trackBot(bot);
    });
  }
});
controller.setupWebserver(nconf.get('PORT') || 3000, (err, expressWebserver) => {
  if (err) {
    throw new Error(err);
  }

  controller.createWebhookEndpoints(expressWebserver);
  controller.createOauthEndpoints(controller.webserver, (error, req, res) => {
    if (error) {
      res.status(500).send('ERROR: ' + error);
    } else {
      res.send('Success!');
    }
  });
});

controller.on('slash_command', (bot, message) => {
  if (message.token === nconf.get('SLACK_SLASH_TOKEN') && message.team_domain === nconf.get('SLACK_TEAM')) {
    Object.values(Matchers.slash).forEach(matcher => matcher.match(bot, message));
  }
});

handleInteractiveMessages(controller);

controller.storage.teams.all((err, teams) => {
  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (const t in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM((error, bot) => {
        if (error) {
          console.log('Error connecting bot to Slack:', error);
        } else {
          registerNotifications(bot);
          trackBot(bot);
        }
      });
    }
  }
});

Object.values(Matchers.bot).forEach(matcher => matcher.match(controller));

export default controller;
