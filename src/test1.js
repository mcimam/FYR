const puppeteer = require('puppeteer');
const { Crawler } = require('./main');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  

(async () => {
  try {
    const crawler = await Crawler.build()
    const browser = crawler.browser
    
    const page = await crawler.page_sellercenter()
    page.setDefaultNavigationTimeout(2*60*1000);
  
    await delay(500)
    page.close()
  
      
  } catch (error) {
    console.error(error)      
  }
})();