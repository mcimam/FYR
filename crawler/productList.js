const puppeteer = require('puppeteer');
const { SetRegistry, ValueRegistry } = require('./helper');
const { Crawler } = require('./crawler');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  

const getProductList = async (crawler) => {
  try {
    const crawler = await Crawler.build()
    const page = await crawler.page_sellercenter()
    const setRegister = new SetRegistry('product/productList')

    page.setViewport({
        height: 1000,
        width: 950
    })

    await page.goto('https://seller-id.tiktok.com/product')

    await page.waitForSelector('.arco-table-body')
    const product_tds = await page.$$("tr[class='arco-table-tr']")

    for (const product_td of product_tds){
        const register = new ValueRegistry()

        let product_id = await product_td.$("td:nth-child(3) > div > span > div > div:nth-child(2) > div:nth-child(2) > span ")
        if(product_id){
            const txt = await page.evaluate(
                element => element.innerHTML.split(':').pop(0),
                product_id
            )
            register.addValue("pid",txt,true)
        }
        
        setRegister.append(register)
    }


    await delay(500)
    page.close()
    setRegister.saveJson()
    await setRegister.saveCSV()
    
    return setRegister
      
  } catch (error) {
    throw new Error(error)
  }
};

module.exports = {
  getProductList
}