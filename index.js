'use strict';

import Botkit from 'botkit';

if (!process.env.token) {
  throw new Error('Error: Specify token in environment');
}

const controller = Botkit.slackbot({
  debug: true,
});

controller.spawn({ token: process.env.token }).startRTM(err => {
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

export default controller;
