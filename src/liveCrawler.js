const puppeteer = require('puppeteer');
const { ValueRegistry, SetRegistry } = require('./helper');
const { Crawler } = require('./main');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function showModal(page, selector){
  page.click()
}

async function getDataOverview(page) {
  const register = new ValueRegistry()
  
  // The logic are
  // - Each card have their own unique id
  // - Just select coonsistent selector from it

  const card_ids = ['view_cnt', 'revenue', 'order_cnt', 'enter_room_rate', 'product_display_rate', 'product_ctr', 'product_co']
  await delay(1000)
  for(const cid of card_ids){
    try {
      const card = await page.$(`#${cid} > div:nth-child(2) > div > div`)
      const txt = await page.evaluate(card => card.textContent, card)
  
      register.addValue(cid, txt)        
    } catch (error) {
      console.log(`can't get data for ${cid}`)
      console.warn(error)
    }
  }

  return register
}

export const getLiveData = async() => {
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
    
    await page.goto('https://seller-id.tiktok.com/compass/live-analysis')
    await page.waitForSelector('table')
    await delay(5000)

    // // Get Today Overview
    // // const today_overview_data = new ValueRegistry()
    // const trafic_register = new SetRegistry('live/liveOverview')
    // // Organic Trafic Detail
    // try {
    //   await page.click('#live_traffic_table > div > div:nth-child(2) > div > div > div > div > div > div > table > tbody > tr:first-child > td:nth-child(9) > div',)
    //   organic_trafic_data = await getDataOverview(page)
    //   trafic_register.append(organic_trafic_data)
    //   await page.click('span[aria-label=Close]')
      
    // } catch (error) {
    //   console.log("Can't get overview data")
    //   console.error(error)
    // }

    // await delay(1000)
    // // Promoted trafic detail
    // try {
    //   await page.click('#live_traffic_table > div > div:nth-child(2) > div > div > div > div > div > div > table > tbody > tr:last-child > td:nth-child(9) > div',)
    //   promoted_trafic_data = await getDataOverview(page)
    //   trafic_register.append(promoted_trafic_data)
    //   await page.click('span[aria-label=Close]')
    // } catch (error) {
    //   console.log("Can't get overview data")
    //   console.error(error)
    // }
    // trafic_register.saveJson()
    // trafic_register.saveCSV()
    // console.log("-- Get Overview")
    // await delay(2000)

    //Get Livestream data
    // Checklist all metrix
    await page.click('xpath/' + "//button[contains(., 'Metrics')]")
    await page.waitForSelector('.zep-modal-content')

    await page.$$eval('label.zep-checkbox', elements => elements.map(element => {
        console.log(element.querySelector('input.zep-checkbox-input').checked)
        if(!element.querySelector('input.zep-checkbox-input').checked){
         element.click() 
        }
    }))
    await page.click('xpath/' + "//button[contains(., 'Save')]")
    await delay(500)
    console.log("-- Set Metrics")

    // Download File
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: process.env.SAVELOC + '/live',
    });

    // Download by click export
    try {
      await delay(500)
      await page.click('xpath/' + "//button/span[contains(., 'Export')]")
      await delay(1000)
      console.log("-- Downloading File")  
    } catch (error) {
      console.error('Failed to download csv')
    }

    console.log("== FINSIH LIVE CRAWL ==")
    page.close()
  } catch (error) {
    console.error(error)      
  }
};