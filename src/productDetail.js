const productList = [
'1729591730322114915',
'1729384826618807651',
'1729384826784679267',
'1729446137053940067',
'1729384826539050339',
'1729446148541286755',
'1729446145884129635',
'1729446146862844259',
'1729572668134689123',
'1729384826605503843',
'1729579700097419619',
'1729572656444246371',
'1729598930902878563',
'1729572661860010339',
'1729384826829178211',
'1729384099869918563',
'1729384826658653539',
'1729572646214928739',
'1729570347504077155',
'1729570350754466147',
'1729591703049046371',
'1729602060183636323',
'1729599927414196579',
'1729560417953417571',
'1729384825576457571',
'1729384826782713187',
'1729384826640958819',
'1729384826505758051',
'1729384826470761827',
'1729582571228072291',
'1729502781415852387',
'1729502795450845539',
]

const puppeteer = require('puppeteer');
const { Crawler } = require('./main');
const { ValueRegistry, delay } = require('./helper')

// Just function to loping data
// Because we must click each box and reget the data
async function getData(page, register) {
  const key = ['Revenue', 'orders', 'buyers', 'product sales', 'product impressions', 'ctr', 'co', 'product-related negative review rate', 
              'complaint Rate', 'rate of returns for quality reasons', 'refunds', 'refund orders', 'refund sales', 'refund buyers', 'commision',
              'product clicks', 'users viewing products', 'users clicking products',
              'negative review number']
  const infos = await page.$$('.ecom-data-visualize-overflow-text-content')
  
  let switch_get = false
  for (const info of infos){
       const txt = await page.evaluate(
            element => element.textContent.toLowerCase().trim(),
            info
        )

        if(key.includes(txt)){
          register.registerKey(txt)
          switch_get = true
          continue;
        }

        if(switch_get == true) {
          register.registerValue(txt)
        }
        switch_get = false

    }
}

(async () => {
  try {
    const crawler = await Crawler.build()
    const browser = crawler.browser
    
    // const page = await crawler.page_sellercenter()
    // page.setDefaultNavigationTimeout(2*60*1000);


    const page = await browser.newPage()
    page.setViewport({
        height: 1000,
        width: 950
    })

    await page.goto(`https://seller-id.tiktok.com/compass/product-analysis/detail?id=${productList[0]}`)
 

    await page.waitForSelector('#product_detail_performance')
    await delay(2000)


    // The algorithm is this:
    // - ecom-data-visualize-overflow-text-content => Class for title and value
    // - assume that this selector select (key,value) in order
    // - If this loop detect key, next loop get value with check if it's actually a value
    const register = new ValueRegistry()

    //  Revenue
    await page.click('.relative.flex-1:nth-child(1)')
    await getData(page, register)
    
    await page.click('.relative.flex-1:nth-child(2)')
    await getData(page, register)

    await page.click('.relative.flex-1:nth-child(3)')
    await getData(page, register)

    await delay(5000)
    page.close()
  
      
  } catch (error) {
    console.error(error)      
  }

  process.exit()
})();