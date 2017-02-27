import moment from 'moment-timezone';

export default function sendMessageToChannel(text, channel, slushbot) {
  console.log(`sending to: ${channel}`);
  const event = JSON.parse(text);
  slushbot.say({
    channel,
    attachments: [
      {
        fallback: 'New Event',
        color: '#1E5A8D',
        title: event.name,
        title_link: 'https://sse.rit.edu/events/', // eslint-disable-line camelcase
        fields: [
          {
            title: 'Description',
            value: event.description || '',
          },
          {
            title: 'Location',
            value: event.location,
            short: true,
          },
          {
            title: 'Committee',
            value: event.committeeName,
            short: true,
          },
          {
            title: 'Start Date',
            value: moment(event.startDate).tz('America/New_York').format('MMMM D, h:mm a'),
            short: true,
          },
          {
            title: 'End Date',
            value: moment(event.endDate).tz('America/New_York').format('MMMM D, h:mm a'),
            short: true,
          },
        ],
        image_url: event.image, // eslint-disable-line camelcase
        footer: 'Society of Software Engineers',
        footer_icon: 'https://pbs.twimg.com/profile_images/1470704507/just-logo-small.png', // eslint-disable-line camelcase

      },
    ],
  });
}
