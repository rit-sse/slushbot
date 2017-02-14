import getAPI from '../api';
import nconf from '../config';

export default function sendMessageToChannel(text, channel, slushbot) {
  console.log(`sending to: ${channel}`);
  const quote = JSON.parse(text);
  slushbot.say({
    text: `${quote.body}\n *Description:* ${quote.description}`,
    channel,
    attachments: [
      {
        title: 'Would you like to approve this quote?',
        callback_id: `quote_${quote.id}`, // eslint-disable-line camelcase
        attachment_type: 'default', // eslint-disable-line camelcase
        actions: [
          {
            name: 'yes',
            text: 'Yes',
            value: 'yes',
            type: 'button',
          },
          {
            name: 'no',
            text: 'No',
            value: 'no',
            style: 'danger',
            type: 'button',
          },
        ],
      },
    ],
  });
}

export function handleQuoteResponse(bot, message) {
  const matchCallbackId = message.callback_id.match(/quote_(\d+)/);
  const { Quotes, Auth } = getAPI();
  if (matchCallbackId) {
    bot.api.users.info({ user: message.user }, (err, res) => {
      if (err) {
        return bot.replyPrivate(message, 'There was an error getting your user information');
      }

      const matchEmail = res.user.profile.email.match(/^([a-z]{2,3}\d{4})@rit\.edu$/);
      if (!matchEmail) {
        return bot.replyPrivate(message, 'Not a valid RIT email. Change your email if you wish to run authed commands');
      }

      return Auth
        .getToken('slack', matchEmail[1], nconf.get('SLACK_SECRET'))
        .then(() => {
          if (message.actions[0].value === 'yes') {
            return Quotes
              .update(matchCallbackId[1], { approved: true })
              .then(quote => {
                bot.replyInteractive(message, {
                  text: `${quote.body}\n *Description:* ${quote.description}`,
                  attachments: [
                    {
                      title: `@${res.user.name} approved the quote!`,
                      attachment_type: 'default', // eslint-disable-line camelcase
                    },
                  ],
                });
              });
          }
          return Quotes
              .update(matchCallbackId[1], { approved: false })
              .then(quote => {
                bot.replyInteractive(message, {
                  text: `${quote.body}\n *Description:* ${quote.description}`,
                  attachments: [
                    {
                      title: `@${res.user.name} rejected the quote!`,
                      attachment_type: 'default', // eslint-disable-line camelcase
                    },
                  ],
                });
              });

        })
        .catch(e => console.log(e));
    });
  }
}

