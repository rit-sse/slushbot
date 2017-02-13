import getAPI from '../api';
import nconf from '../config';

export default function sendMessageToChannel(text, channel, slushbot) {
  console.log(`sending to: ${channel}`);
  const membership  = JSON.parse(text);
  slushbot.say({
    text: `*DCE:* ${membership.userDce}\n *Committee:* ${membership.committeeName}\n *Reason:* ${membership.reason}`,
    channel,
    attachments: [
      {
        title: 'Would you like to approve this membership?',
        callback_id: `membership_${membership.id}`, // eslint-disable-line camelcase
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

export function handleMembershipResponse(bot, message) {
  const matchCallbackId = message.callback_id.match(/membership_(\d+)/);
  const { Memberships, Auth } = getAPI();
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
            return Memberships
              .update(matchCallbackId[1], { approved: true })
              .then(membership => {
                bot.replyInteractive(message, {
                  text: `*DCE:* ${membership.userDce}\n *Committee:* ${membership.committeeName}\n *Reason:* ${membership.reason}`,
                  attachments: [
                    {
                      title: `@${res.user.name} approved the membership!`,
                      attachment_type: 'default', // eslint-disable-line camelcase
                    },
                  ],
                });
              });
          }
          return Memberships
              .update(matchCallbackId[1], { approved: false })
              .then(membership => {
                bot.replyInteractive(message, {
                  text: `*DCE:* ${membership.userDce}\n *Committee:* ${membership.committeeName}\n *Reason:* ${membership.reason}`,
                  attachments: [
                    {
                      title: `@${res.user.name} rejected the membership!`,
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

