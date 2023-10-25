const axios = require('axios');
const cheerio = require('cheerio');

let cachedData = {};
const CACHE_DURATION = 86400000; // 24 hours in milliseconds
let lastFetched = null;

const keywordMapping = {
 'launch': 'https://fly.io/docs/apps/launch/',
 'deploy': 'https://fly.io/docs/apps/deploy/',
 'pricing': 'https://fly.io/docs/about/pricing',
 'info': 'https://fly.io/docs/apps/info/',
 'custom domain': 'https://fly.io/docs/apps/custom-domain/',
 'scale machine': 'https://fly.io/docs/apps/scale-machine/',
 'scale count': 'https://fly.io/docs/apps/scale-count/',
 'autostart autostop': 'https://fly.io/docs/apps/autostart-stop/',
 'volume storage': 'https://fly.io/docs/apps/volume-storage/',
 'volume manage': 'https://fly.io/docs/apps/volume-manage/',
 'restart': 'https://fly.io/docs/apps/restart/',
 'processes': 'https://fly.io/docs/apps/processes/',
 'migrate': 'https://fly.io/docs/apps/migrate-to-v2/',
 'configuration': 'https://fly.io/docs/reference/configuration/' 
};

async function scrapeDocs() {
    const now = Date.now();

    // Check if cached data is still valid
    if (cachedData && lastFetched && now - lastFetched < CACHE_DURATION) {
        console.log("Returning cached data");
        return cachedData;
    }
    try {
      for (const key in keywordMapping) { // Changed loop to correctly iterate over object
        const url = keywordMapping[key]; // Get the URL using the key
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const content = [];
        $('p').each((index, element) => {
            content.push($(element).text());
        });
        
          
          // Extracting the last part of the URL to use as a key
          const urlKey = url.split('/').filter(Boolean).pop();
          cachedData[urlKey] = content.join('\n');
      }
        lastFetched = now;
        return cachedData;
    } catch (error) {
        console.error("Error scraping data:", error.message);
        return null;
    }
}

async function getRelevantSections(query) {
  const docsData = await scrapeDocs();
  const relevantUrls = [];
  
  for (let keyword in keywordMapping) {
    if (query.includes(keyword)) {
      relevantUrls.push(keywordMapping[keyword]);
    }
  }

  let relevantContent = '';
  for (const url of relevantUrls) {
    const key = url.split('/').filter(Boolean).pop();
    relevantContent += `---- ${key.toUpperCase()} ----\n` + docsData[key] + '\n\n';
  }

  return relevantContent;
}

export default async function handler(req, res) {
    const userQuery = req.body.question;
    const relevantDocsContent = await getRelevantSections(userQuery);
  
    if (relevantDocsContent) {
        res.status(200).send(relevantDocsContent); // Changed from `data` to `relevantDocsContent`
    } else {
        res.status(200).send("Can you provide more specifics or rephrase your question?");
    }
}
module.exports = scrapeDocs