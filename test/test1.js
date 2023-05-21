const puppeteer = require('puppeteer');
const { ValueRegistry } = require('../src/helper');
const { Crawler } = require('../src/main');

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

(async () => {
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
    // await delay(5000)

    // // Get Today Overview
    // // const today_overview_data = new ValueRegistry()
    
    // // Organic Trafic Detail
    // try {
    //   await page.click('#live_traffic_table > div > div:nth-child(2) > div > div > div > div > div > div > table > tbody > tr:first-child > td:nth-child(9) > div',)
    //   organic_trafic_data = await getDataOverview(page)
    //   console.log(organic_trafic_data)
    //   await page.click('span[aria-label=Close]')
      
    // } catch (error) {
    //   console.log("Can't get overview data")
    //   console.error(error)
    // }

    // await delay(1000)
    // // Promoted trafic detail
    // try {
    //   await page.click('#live_traffic_table > div > div:nth-child(2) > div > div > div > div > div > div > table > tbody > tr:last-child > td:nth-child(9) > div',)
    //   const modal = await page.$('.compass-arco-modal-content')
    //   promoted_trafic_data = await getDataOverview(page)
    //   console.log(promoted_trafic_data)
    //   await page.click('span[aria-label=Close]')
    // } catch (error) {
    //   console.log("Can't get overview data")
    //   console.error(error)
    // }

    // await delay(1000)

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
    
    // Download File
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: process.env.SAVELOC || '/home/mcimam/PersonalProject/Fyr/result',
    });

    // Download by click export
    // await page.click('xpath/' + "//button[contains(., 'Export')]")
    await delay(500)
    await page.click('#GEC-main > div.pb-16 > div:nth-child(3) > div:nth-child(4) > div.flex.justify-between > div.flex.items-center.gap-8 > div.flex.gap-8 > div > button')
    await delay(500)
    await page.click('xpath/' + "//button[contains(., 'Download')]")

    page.close()
  } catch (error) {
    console.error(error)      
  }
})();