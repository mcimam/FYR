const puppeteer = require('puppeteer');

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

class Crawler {
    constructor() {
        this.user = ""
        this.pass = ""
        this.url = ""
        // this.auth = 'brd-customer-hl_062ce0fd-zone-scraping_browser:ibjuogydndx4';
        this.wsSocket = 'ws://127.0.0.1:9222/devtools/browser/a8da8093-24c7-4c9e-b02e-7a126bb83e03'
    }    

    static async build() {
        let crawler = new Crawler();
        await crawler._init();
        return crawler;
    }
    async _init() {
        //launch the browser and keep its state
        // this._browser = await puppeteer.launch({
        //     headless: false,
        //     userDataDir: "./user_data",
        //     args: ['--no-sandbox', '--disable-setuid-sandbox']      
        // });

        // Use existing browser session
        this._browser = await puppeteer.connect({
            browserWSEndpoint: this.wsSocket
        })
  
    }
    //getter
    get browser() {
        return this._browser;
    }
    //getter
    get page() {
        return this._page;
    }

    async login() {
        const page = await this._browser.newPage();
        await page.goto('https://www.tiktok.com/login/phone-or-email/email')

        // insert email
        await page.type("input[name='username']", "feyrely")
        await page.type("input[type='password']","Feyrelyorion9!")

        await delay(1000)
        await page.click("button[type='submit'")
        await page.close()
    }

    async page_sellercenter() {
        const page = await this._browser.newPage();

        await page.goto('https://seller-id.tiktok.com/account/login/');
        
        // Check if already login
        await delay(2000)
      
        if((await page.$('#TikTok_Ads_SSO_Login_Btn')) !== null){
          await Crawler.login()
          await page.reload()
          await delay(2000)
        }
    

        return page
    }
}


module.exports = {Crawler}