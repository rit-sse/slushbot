'use strict';

import MatcherRegister from '../../matcher-register';
import { slushbot } from '../../bot';
import nconf from '../../config';
import fetch from 'node-fetch';
import crypto from 'crypto';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function parseJSON(response) {
  return response.json();
}

const matcher = {
  name: 'mail',
  help: {
    '/sse mail subscribe [email]': 'Subscribe yourself or a specified email to the mailing list',
    '/sse mail unsubscribe [email]': 'Unsubscribe yourself or a specified email to the mailing list',
  },

  match(bot, message) {
    const match = message.text.match(/mail (subscribe|unsubscribe)\s?(.*)/);
    if (match) {
      const url = `https://anystring:${nconf.get('MAILCHIMP_KEY')}@us2.api.mailchimp.com/3.0/lists/${nconf.get('MAILCHIMP_LIST_ID')}/members`;
      slushbot.api.users.info({ user: message.user_id }, (err, res) => {
        if (err) {
          return bot.replyPrivate(message, 'There was an error getting your user information');
        }

        const email = match[2].trim() || res.user.profile.email;
        const firstName = res.user.profile.first_name;
        const lastName = res.user.profile.last_name;
        const memberUrl = `${url}/${crypto.createHash('md5').update(email).digest('hex')}`;
        if (match[1] === 'subscribe') {
          fetch(memberUrl, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
            .then(checkStatus)
            .then(() => {
              return fetch(memberUrl, {
                method: 'PATCH',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  status: 'subscribed',
                }),
              })
                .then(checkStatus);
            })
            .catch(() => {
              return fetch(url, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email_address: email, // eslint-disable-line camelcase
                  status: 'subscribed',
                  merge_fields: { // eslint-disable-line camelcase
                    FNAME: firstName,
                    LNAME: lastName,
                  },
                }),
              })
              .then(checkStatus)
              .then(parseJSON);
            })
            .then(() => bot.replyPrivate(message, `Successfully subscribed ${email} to mailing list`))
            .catch(() => bot.replyPrivate(message, `Error Subscribing you to mailing list. You are probably already subscribed.`));
        } else {
          fetch(memberUrl, {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'unsubscribed',
            }),
          })
            .then(checkStatus)
            .then(parseJSON)
            .then(() => bot.replyPrivate(message, `Successfully unsubscribed ${email} from mailing list`))
            .catch(() => bot.replyPrivate(message, 'Error unsubscribing you from the mailing list. You probably aren\'t subscribed'));
        }
      });
    }
  },
};

MatcherRegister.registerSlash(matcher);
