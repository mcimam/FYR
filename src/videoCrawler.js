const puppeteer = require('puppeteer');
const { Crawler } = require('./crawler');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function showModal(page, selector){
  page.click()
}

const getVideoData = async () => {
  try {
    const crawler = await Crawler.build()
    const browser = crawler.browser
    const page = await browser.newPage();
    // const page = await crawler.page_sellercenter()
    // page.setDefaultNavigationTimeout(2*60*1000);

    page.setViewport({
      height: 1000,
      width: 1200
    })
    
    await page.goto('https://seller-id.tiktok.com/compass/video-analytics')
    await page.waitForSelector('table')
    await delay(5000)
    //Get Livestream data
    // Checklist all metrix
    await page.click('xpath/' + "//button[contains(., 'Metrics')]")
    await page.waitForSelector('.zep-modal-content')

    await page.$$eval('label.zep-checkbox', elements => elements.map(element => {
        if(!element.querySelector('input.zep-checkbox-input').checked){
         element.click() 
        }
    }))
    await page.click('xpath/' + "//button[contains(., 'Save')]")
    await delay(500)

    // Download File
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: process.env.SAVELOC + '/video',
    });

    // Download by click export
    try {
      await delay(500)
      await page.click('xpath/' + "//button/span[contains(., 'Export')]")
      await delay(1000)
    } catch (error) {
      console.error('Video Data: Failed to download csv')
    }

    page.close()
  } catch (error) {
    console.error(error)      
  }
};

module.exports = {
  getVideoData
}