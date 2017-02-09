import MatcherRegister from '../../matcher-register';
import getAPI from '../../api';
import { slushbot } from '../../bot';

function getMemberships(dce, bot, message, Memberships) {
  return Memberships
    .all({ user: dce, active: new Date(), approved: true })
    .then(({ total }) => {
      if (total > 0) {
        return bot.replyPrivate(message, `${dce} is a member with ${total} memberships`);
      }
      return bot.replyPrivate(message, `${dce} is not a member`);
    })
    .catch(err => bot.replyPrivate(message, `There was an error getting a memberships - ${err.message}`));
}

const matcher = {
  name: 'member',
  help: {
    '/sse member': 'check if you are a member',
    '/sse member [dce]': 'check if someone else is a member',
  },

  match(bot, message) {
    const api =  getAPI();
    const { Memberships } = api;

    const matchCommand = message.text.match(/member(\s[a-z]{2,3}\d{4})?$/);

    if (matchCommand) {
      const [, dce] = matchCommand;

      if (!dce) {
        slushbot.api.users.info({ user: message.user_id }, (err, res) => {
          if (err) {
            return bot.replyPrivate(message, 'There was an error getting your user infomation');
          }
          const matchEmail = res.user.profile.email.match(/^([a-z]{2,3}\d{4})@rit\.edu$/);
          if (!matchEmail) {
            return bot.replyPrivate(message, 'Not a valid RIT Email. Change your email or provide a DCE to use this command');
          }
          getMemberships(matchEmail[1], bot, message, Memberships);
        });
      } else {
        getMemberships(dce.trim(), bot, message, Memberships);
      }
    }
  },
};

MatcherRegister.registerSlash(matcher);
