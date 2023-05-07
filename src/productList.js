const puppeteer = require('puppeteer');
const { Crawler } = require('./main');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  

(async () => {
  try {
    const crawler = await Crawler.build()
    const browser = crawler.browser
    
    const page = await crawler.page_sellercenter()

    page.setViewport({
        height: 1000,
        width: 950
    })

    await page.goto('https://seller-id.tiktok.com/product')

    await page.waitForSelector('.arco-table-body')
    const product_tds = await page.$$("tr[class='arco-table-tr']")


    for (const product_td of product_tds){
        // console.log(product_td)
        let product_id = await product_td.$("td:nth-child(3) > div > span > div > div:nth-child(2) > div:nth-child(2) > span ")
        if(product_id){
            const txt = await page. evaluate(
                element => element.innerHTML.split(':').pop(0),
                product_id
            )
            console.log(txt)
        }

        
        // await page.evaluateHandle
    }


    await delay(500)
    page.close()
    console.log("finish")
  
      
  } catch (error) {
    console.error(error)      
  }
})();