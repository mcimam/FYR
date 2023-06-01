// CRAWLER For Product Data

const puppeteer = require('puppeteer');
const { SetRegistry,ValueRegistry, delay } = require('./helper');
const { Crawler } = require('./crawler');
  

async function getOrCrawlPID(){
    const set_register = new SetRegistry('productList')
    let data =  set_register.getJson()
    
    if(set_register.isEmpty()){
      set_register.value = [
        new ValueRegistry({pid: '1729591730322114915'}),
        new ValueRegistry({pid: '1729384826618807651'}),
        new ValueRegistry({pid: '1729384826784679267'}),
        new ValueRegistry({pid: '1729446137053940067'}),
        new ValueRegistry({pid: '1729384826539050339'}),
        new ValueRegistry({pid: '1729446148541286755'}),
        new ValueRegistry({pid: '1729446145884129635'}),
        new ValueRegistry({pid: '1729446146862844259'}),
        new ValueRegistry({pid: '1729572668134689123'}),
        new ValueRegistry({pid: '1729384826605503843'}),
        new ValueRegistry({pid: '1729579700097419619'}),
        new ValueRegistry({pid: '1729572656444246371'}),
        new ValueRegistry({pid: '1729598930902878563'}),
        new ValueRegistry({pid: '1729572661860010339'}),
        new ValueRegistry({pid: '1729384826829178211'}),
        new ValueRegistry({pid: '1729384099869918563'}),
        new ValueRegistry({pid: '1729384826658653539'}),
        new ValueRegistry({pid: '1729572646214928739'}),
        new ValueRegistry({pid: '1729570347504077155'}),
        new ValueRegistry({pid: '1729570350754466147'}),
        new ValueRegistry({pid: '1729591703049046371'}),
        new ValueRegistry({pid: '1729602060183636323'}),
        new ValueRegistry({pid: '1729599927414196579'}),
        new ValueRegistry({pid: '1729560417953417571'}),
        new ValueRegistry({pid: '1729384825576457571'}),
        new ValueRegistry({pid: '1729384826782713187'}),
        new ValueRegistry({pid: '1729384826640958819'}),
        new ValueRegistry({pid: '1729384826505758051'}),
        new ValueRegistry({pid: '1729384826470761827'}),
        new ValueRegistry({pid: '1729582571228072291'}),
        new ValueRegistry({pid: '1729502781415852387'}),
        new ValueRegistry({pid: '1729502795450845539'}),
      ]
      data = set_register.value
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
  register.addValue("pid", pid)

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
  const set_register = new SetRegistry('/product/productAnalysis')
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
