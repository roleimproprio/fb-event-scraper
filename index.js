const url = require('url');

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const scrapeIt = require('scrape-it');

const FACEBOOK_URL = 'https://facebook.com';
const FACEBOOK_EVENTS_PATHNAME = '/events';

/**
 * TODO: write docs
 */
const fetchPageContents = async (fbPageUrl) => {
  const browser = await puppeteer.launch();
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
const fetchUpcomingEvents = async (fbPageUrl) => {
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
const scrapEventData = async (fbEventUrl) => {
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
      convert: (dateStr) => new Date(dateStr),
    },
  });

  console.log(data);
  return data;
};

scrapEventData('https://facebook.com/events/1241375742677943/');
