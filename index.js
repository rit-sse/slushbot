'use strict';

import Botkit from 'botkit';
import redisStore from './storage/redis';
import slashMatchers from './matchers/slash';
import botMatchers from './matchers/bot';

if (!process.env.token) {
  throw new Error('Error: Specify token in environment');
}

const controller = Botkit.slackbot({
  debug: false,
  storage: redisStore(),
});

const slushbot = controller.spawn({ token: process.env.token });

slushbot.api.team.info({}, (err, res) => {
  if (err) {
    throw new Error(err);
  }

  controller.saveTeam(res.team, () => controller.log('Stored Team Information'));
});

slushbot.startRTM(err => {
  if (err) {
    throw new Error(err);
  }
});

controller.setupWebserver(process.env.port || 3000, (err, expressWebserver) => {
  if (err) {
    throw new Error(err);
  }

  controller.createWebhookEndpoints(expressWebserver);
});

controller.on('slash_command', (bot, message) => slashMatchers.forEach(matcher => matcher.match(bot, message)));

botMatchers.forEach(matcher => matcher.match(controller));

export default controller;
