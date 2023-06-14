from playwright.sync_api import sync_playwright
import os

class AnalysisAut:
    def __init__(self,save_path='./', mode='dev', no_download=False) -> None:
        print('start')
        self.pw = sync_playwright().start()
        
        # self param
        self.mode = mode
        self.nd = no_download
        self.sp = save_path
        
        # Init Browser and context
        if self.mode == 'dev':
            self.browser = self.pw.chromium.connect_over_cdp("http://localhost:9222")        
            self.default_context = self.browser.contexts[0]
            self.contexts = [self.default_context]
        else:
            self.browser = self.pw.chromium.launch()
            self.default_context = self.browser.new_context()
            self.contexts = [self.default_context]
        
        self.active_page = None
    
    def __del__(self) -> None:
        print('finish')
        if self.mode != 'dev':
            self.browser.close()
            
        self.pw.stop()
   
    def createPage(self) -> object:
        page =  self.default_context.new_page()
        self.active_page = page
        return page
    
    def loginSellerCenter(self):
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/account/login')
        page.wait_for_timeout(1000)
        if page.url != 'https://seller-id.tiktok.com/account/login':
            page.close()
            print('already login')
            return
        
        page.wait_for_selector('button')
        page.get_by_role("button", name="Log in with TikTok account").click()
        page.wait_for_selector('button')
        page.locator('#auth-btn').click()
        page.wait_for_timeout(1000)
        print('login')
        page.close()
        
    def _downloadReport(self, page=None, filename=None):
        if not page:
            page = self.active_page
    
        page.wait_for_timeout(500)
        try:
            page.click('xpath=//button[contains(., "Metrics")]', timeout=100)
            page.wait_for_selector('.zep-modal-content')
            
            elements = page.query_selector_all('label.zep-checkbox')
            for element in elements:
                if not element.query_selector('input.zep-checkbox-input').is_checked():
                    element.click()
            page.click('xpath=//button[contains(., "Save")]')
            page.wait_for_timeout(500)

        except:
            print('Failed: metrix option not found')
        
        try:
            # Download by clicking export
            with page.expect_download() as download_info:
                page.wait_for_timeout(500)
                page.get_by_role("button", name="Export", timeout=100).click()
                download = download_info.value
                if not filename:
                    filename = download.suggested_filename
                    
                download.save_as(f"{self.sp}/{filename}")
                print('download success')
        
        except:
            print('retry download')
            page.get_by_role("button", name="Download").first().click()
            download = download_info.value
            if not filename:
                filename = download.suggested_filename
                
            download.save_as(f"{self.sp}/{filename}")
            print('download success')                    

    
    def videoAnalysis(self):
        print('start video analysis')

        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/video-analytics')
        page.wait_for_selector('table')
        self._downloadReport(page, 'video.xlsx')
        page.close()
    
    def liveAnalysis(self):
        print('start live analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/live-analysis')
        page.wait_for_selector('table')
        self._downloadReport(page, 'live.xlsx')
        page.close()
        
    def productAnalysis(self):
        print('start live analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/product-analysis')
        page.wait_for_selector('table')
        self._downloadReport(page, 'product.xlsx')
        page.close()
        
    def marketingAnaylisis(self):
        print('start marketing analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/promotion-analytics')
        page.wait_for_selector('table')
        # Check each martkering tools than download
        marketing_tools = ["Product Discount","Flash Deal","Shipping Fee Discount","Voucher","Buy More Save More"]
        for tool in marketing_tools:
            # try:
            page.locator("label").filter(has_text=tool).click()
            page.wait_for_timeout(500)
            self._downloadReport(page, f'marketing {tool}.xlsx')
                
            # except:
            #     print('Failed')
        page.close()

if __name__ == "__main__":
    pws = AnalysisAut(save_path='/home/mcimam/PersonalProject/Fyr/result',mode='dev')
    pws.loginSellerCenter()
    pws.liveAnalysis()
    pws.videoAnalysis()
    pws.productAnalysis()
    pws.marketingAnaylisis()
    del pws
    print('DONE')