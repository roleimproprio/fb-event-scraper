import test from 'ava';
import fbEventScraper from './';


test('scrap upcoming events', async (t) => {
  const fbPages = [
    'https://www.facebook.com/bandaaldan/',
    'https://www.facebook.com/deafkidspunx',
    'https://www.facebook.com/brevepompeia/',
  ];

  for (const url of fbPages) {
    const events = await fbEventScraper.scrapUpcomingEvents(url);

    t.true(Array.isArray(events));

    for (const event of events) {
      t.truthy(event.url);
      t.truthy(event.title);
    }
  }
});

test('scrap event', async (t) => {
  const events = [
    ['https://www.facebook.com/events/288973745072356', {
      url: 'https://www.facebook.com/events/288973745072356',
      title: 'Desgraça e Talvez Eu Pegue Fogo em SP',
      dateTime: {
        start: new Date('2019-01-11T22:00:00.000Z'),
        end: new Date('2019-01-12T02:59:00.000Z'),
      },
      venue: {
        name: 'Breve',
        address: 'Rua Clélia, 470, 05042-000 São Paulo',
        pageUrl: 'https://www.facebook.com/brevepompeia/',
      },
      ticketsUrl: undefined,
    }],
  ];

  for (const [url, expected] of events) {
    const actual = await fbEventScraper.scrapEvent(url);

    t.is(actual.url, expected.url);
    t.is(actual.title, expected.title);
    t.truthy(actual.coverImageUrl);
    t.deepEqual(actual.dateTime, expected.dateTime);
    t.deepEqual(actual.venue, expected.venue);
    t.is(actual.ticketsUrl, expected.ticketsUrl);
    t.truthy(actual.details);
  }
});
