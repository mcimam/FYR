// CRAWLER For Product Data

const puppeteer = require('puppeteer');
const { SetRegistry,ValueRegistry, delay } = require('./helper');
const { Crawler } = require('./main');
  

async function getOrCrawlPID(){
    const set_register = new SetRegistry('productList')
    let data =  set_register.getJson()
    
    if(set_register.isEmpty()){
      // TODO: Call List Crawler
    }

    return data
}

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

async function crawlProductDetail(browser, pid){
  if(pid == null){
    throw new Error('PID not defined')
    return;
  }
  const page = await browser.newPage()
  page.setViewport({
      height: 1000,
      width: 950
  })

  await page.goto(`https://seller-id.tiktok.com/compass/product-analysis/detail?id=${pid}`)
   
  
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

  page.close()

  return register

}

(async() => {
  const set_register = new SetRegistry('productDetails')
  const crawler = await Crawler.build()
  const browser = crawler.browser

  const product_list = await getOrCrawlPID()

  for(const product of product_list){
    const pid = product.getValue("pid")
    if(pid == null) {continue;}
    const productData = await crawlProductDetail(browser,pid);
    set_register.append(productData)
  }

  set_register.saveJson()
  await set_register.saveCSV()

})();

// (async () => {
//   try {
//     const setRegister = new SetRegistry('productDetails')
//     const browser = crawler.browser
//     const crawler = await Crawler.build()
//     const page = await crawler.page_sellercenter()

//     page.setViewport({
//         height: 1000,
//         width: 950
//     })

//     await page.goto('https://seller-id.tiktok.com/product')

//     // GET OR CRAWL PID

//     await page.waitForSelector('.arco-table-body')
//     const product_tds = await page.$$("tr[class='arco-table-tr']")

//     for (const product_td of product_tds){
//         // console.log(product_td)
//         let product_id = await product_td.$("td:nth-child(3) > div > span > div > div:nth-child(2) > div:nth-child(2) > span ")
//         if(product_id){
//             const txt = await page. evaluate(
//                 element => element.innerHTML.split(':').pop(0),
//                 product_id
//             )
//             console.log(txt)
//         }

        
//         // await page.evaluateHandle
//     }


//     await delay(500)
//     page.close()
//     console.log("finish")
  
      
//   } catch (error) {
//     console.error(error)      
//   }
// })();
