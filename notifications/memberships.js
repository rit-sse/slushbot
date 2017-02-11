// make Interactive messages later
export default function sendMessageToChannel(text, channel, slushbot) {
  console.log(`sending to: ${channel}`);
  slushbot.api.chat.postMessage({
    text,
    channel,
    as_user: true,  // eslint-disable-line camelcase
  }, (err, res) => {
    if (!err) {
      console.log(res);
    } else {
      console.log(err);
    }
  });
}

