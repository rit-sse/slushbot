import MatcherRegister from '../../matcher-register';
import getAPI from '../../api';
import { slushbot } from '../../bot';
import nconf from '../../config';

const matcher = {
  name: 'qdb',
  help: {
    '/sse qdb quote [tag]': 'Return a random quote for a tag',
    '/sse qdb quote #[id]': 'Return a specific quote',
    '/sse qdb add': 'Add a quote in a private conversation with slushbot',
    '/sse qdb approve': 'Approve quotes in a private conversation with slushbot',
  },

  match(bot, message) {
    const api = getAPI();
    const { Quotes, Auth } = api;

    const matchCommand = message.text.match(/qdb (quote|add|approve)\s?(.*)/);

    if (matchCommand) {
      const [, subcommand, commandArgs] = matchCommand;
      if (subcommand === 'quote') {
        const argMatch = commandArgs.match(/#(\d+)|([\w-_]+)/);
        if (argMatch) {
          if (argMatch[1]) {
            return Quotes
              .one(argMatch[1])
              .then(quote => bot.replyPublic(message, `> ${quote.body.replace(/\r\n|\r|\n/g, '\n>')}`))
              .catch(err => bot.replyPrivate(message, `There was an error getting the quote - ${err.message}`));
          }
          return Quotes
            .all({ tag: argMatch[2] }, true)
            .then(quotes => {
              if (quotes.length === 0) {
                return Promise.reject({ message: 'No quotes with that tag exist' });
              }
              const quote = quotes[Math.floor(Math.random()*quotes.length)];
              return bot.replyPublic(message, `> ${quote.body.replace(/\r\n|\r|\n/g, '\n>')}`);
            })
            .catch(err => bot.replyPrivate(message, `There was an error getting a quote - ${err.message}`));
        }
        return bot.replyPrivate(message, 'Invalid qdb command - run /sse help qdb for detailed usage');
      }
      slushbot.api.users.info({ user: message.user_id }, (err, res) => {
        if (err) {
          return bot.replyPrivate(message, 'There was an error getting your user information');
        }

        const matchEmail = res.user.profile.email.match(/^([a-z]{2,3}\d{4})@rit\.edu$/);
        if (!matchEmail) {
          return bot.replyPrivate(message, 'Not a valid RIT email. Change your email if you wish to run authed commands');
        }
        const add = {
          questions: {
            body: 'What\'s the quote?',
            description: 'What\'s the description? (Say \'none\' if you don\'t want to include one)',
            tags: 'What tag\'s do you want to add (space seperated)',
          },

          startConversation() {
            bot.replyPrivate(message, 'Go to your direct message with me to continue adding the quote');
            slushbot.startPrivateConversation(message, add.askBody);
          },

          askBody(response, convo) {
            convo.ask(add.questions.body, (r, c) => {
              add.askDescription(r, c);
              c.next();
            });
          },

          askDescription(response, convo) {
            convo.ask(add.questions.description, (r, c) => {
              add.askTags(r, c);
              c.next();
            });
          },

          askTags(response, convo) {
            convo.ask(add.questions.tags, (r, c) => {
              c.next();
              add.handleResponses(c);
            });
          },

          handleResponses(convo) {
            const responses = convo.extractResponses();
            const quote = {
              body: responses[add.questions.body],
              description: responses[add.questions.description],
              tags: responses[add.questions.tags].split(' '),
            };
            if (quote.description === 'none') {
              quote.description = '';
            }
            return Quotes
              .create(quote)
              .then(() => convo.say('Successfully submitted a quote. It will be visible pending moderation'))
              .catch(e => convo.say(`Error submitted quote - ${e.message}`));
          },
        };

        const approve = {
          startConversation() {
            bot.replyPrivate(message, 'Go to your direct message with me to approve quotes');
            slushbot.startPrivateConversation(message, approve.promptQuotes);
          },

          promptQuotes(response, convo) {
            Quotes
              .all({ approved: 'null' }, true)
              .then(quotes => {
                if (quotes.length === 0) {
                  convo.say('No quotes to approve');
                  convo.next();
                } else {
                  approve.askQuote(quotes, convo);
                }
              })
              .catch(() => {
                convo.say('You don\'t have permission for that #tricked');
                convo.next();
              });
          },

          askQuote(quotes, convo) {
            const quote = quotes[0];
            convo.ask(`Would you like to approve\n ${quote.body}\n Description: ${quote.description}\n Tags: ${quote.tags.map(tag => tag.name).join(', ')}`, [
              {
                pattern: 'skip',
                callback(r, c) {
                  c.say('Skipping quote');
                  quotes.shift();
                  if (quotes.length !== 0) {
                    approve.askQuote(quotes, c);
                  }
                  c.next();
                },
              },
              {
                pattern: slushbot.utterances.yes,
                callback(r, c) {
                  Quotes
                    .update(quote.id, { approved: true })
                    .then(() => {
                      c.say('Quote approved');
                      quotes.shift();
                      if (quotes.length !== 0) {
                        approve.askQuote(quotes, c);
                      }
                      c.next();
                    })
                    .catch(() => {
                      c.say('There was a problem approving this quote');
                      c.next();
                    });
                },
              },
              {
                pattern: slushbot.utterances.no,
                callback(r, c) {
                  Quotes
                    .update(quote.id, { approved: false })
                    .then(() => {
                      c.say('Quote rejected');
                      quotes.shift();
                      if (quotes.length !== 0) {
                        approve.askQuote(quotes, c);
                      }
                      c.next();
                    })
                    .catch(() => {
                      c.say('There was a problem rejecting this quote');
                      c.next();
                    });
                },
              },
            ]);
          },
        };

        const { startConversation } = subcommand === 'add' ? add : approve;

        return Auth
          .getToken('slack', matchEmail[1], nconf.get('SLACK_SECRET'))
          .then(startConversation)
          .catch(e => console.log(e));
      });
    }
  },
};

MatcherRegister.registerSlash(matcher);
