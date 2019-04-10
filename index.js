const url = require('url');
const querystring = require('querystring');

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const scrapeIt = require('scrape-it');

const FACEBOOK_URL = 'https://facebook.com';
const FACEBOOK_EVENTS_PATHNAME = '/events';

/**
 * TODO: write docs
 */
const fetchPageContents = async (fbPageUrl) => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto(fbPageUrl);
  // TODO: Scroll page before fetching its contents so everything is load
  const content = await page.content();

  await browser.close();
  return content;
};

/**
 * TODO: write docs
 */
const scrapUpcomingEvents = async (fbPageUrl) => {
  // TODO: Better validation and formatting of urls. It'd break if the `fbPageUrl` had a slash in the final
  const fbEventsPageUrl = `${fbPageUrl}${FACEBOOK_EVENTS_PATHNAME}`;
  const contents = await fetchPageContents(fbEventsPageUrl);
  const $ = cheerio.load(contents);

  const data = scrapeIt.scrapeHTML($, {
    events: {
      listItem: '#upcoming_events_card table',
      data: {
        title: 'a span',
        url: {
          selector: 'a',
          attr: 'href',
          // TODO: Transform this in a separate function
          convert: (eventUrl) => url.resolve(FACEBOOK_URL, url.parse(eventUrl).pathname),
        },
      },
    },
  });

  return data.events;
};

/**
 * TODO: write docs
 */
const scrapEvent = async (fbEventUrl) => {
  const contents = await fetchPageContents(fbEventUrl);
  const $ = cheerio.load(contents);

  const data = scrapeIt.scrapeHTML($, {
    title: '#seo_h1_tag',
    coverImageUrl: {
      selector: '#event_header_primary img',
      attr: 'src',
    },
    dateTime: {
      selector: '#event_time_info div[content]',
      attr: 'content',
      convert: (dateStr) => {
        const [start, end] = dateStr.split(' to ');
        return {
          start: new Date(start),
          end: (end ? new Date(end) : undefined),
        };
      },
    },
    venue: {
      selector: '#event_summary ul > li:nth-child(2) table tr > td:nth-child(2) > div > div:nth-child(1)',
      data: {
        name: 'a',
        address: 'a + div',
        pageUrl: {
          selector: 'a',
          attr: 'href',
        },
      },
    },
    ticketsUrl: {
      selector: 'li[data-testid=event_ticket_link] > a',
      attr: 'href',
      // TODO: Transform this in a separate function
      convert: (fbSafeUrl) => {
        const parsedUrl = url.parse(fbSafeUrl);
        const parsedQuery = querystring.parse(parsedUrl.query);

        return parsedQuery.u;
      },
    },
    details: {
      selector: 'div[data-testid=event-permalink-details] span',
      how: 'html',
    },
  });

  data.url = fbEventUrl;
  return data;
};

/**
 * TODO: write docs
 */
const scrapEventsFromPage = async (fbPageUrl) => {
  const events = await scrapUpcomingEvents(fbPageUrl);
  const promises = events.map(x => scrapEvent(x.url));

  return await Promise.all(promises);
};

/** @module fb-events-scraper */
module.exports = {
  scrapEvent,
  scrapEventsFromPage,
  scrapUpcomingEvents,
};
