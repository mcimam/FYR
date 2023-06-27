from playwright.sync_api import sync_playwright
from uuid import uuid4
import re

class SkipCrawlException(Exception):
    pass

class TiktokAnalyticAuto:
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
            self.browser = self.pw.chromium.launch_persistent_context('/home/mcimam/PersonalProject/Fyr/browser_context',headless=False)
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

        metrics_button = page.locator('xpath=//button[contains(., "Metrics")]')
        if metrics_button.is_visible():
            metrics_button.click()
            page.wait_for_selector('.zep-modal-content', timeout=1000)
        
            elements = page.query_selector_all('label.zep-checkbox')
            for element in elements:
                if not element.query_selector('input.zep-checkbox-input').is_checked():
                    element.click()
        
            save_button = page.locator(('xpath=//button[contains(., "Save")]'))
            if not save_button.is_disabled():
                save_button.click()
            else:
                # Click Cancel Button
                page.locator("footer button").first.click()

            page.wait_for_timeout(500)            
        
        try:
            export_button = page.get_by_role("button", name="Export")
            
            if export_button.is_disabled():
                raise SkipCrawlException('Export Button Is Disabled') 
            
            # Download by clicking export
            with page.expect_download() as download_info:
                export_button.click()
                # page.wait_for_timeout(500)
    
            download = download_info.value
    
        except SkipCrawlException as err:
            print(err)
        
        except:
            print('retry download')
            with page.expect_download() as download_info:
            
                list_button = page.locator("div").filter(has_text=re.compile(r"^Export")).get_by_role("button").nth(1)
                list_button.click()
                
                redownload_button = page.get_by_role("button", name="Download")
                redownload_button.first.click()
                
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

        fn = f'vd-{str(uuid4())}.xlsx'        
        rslt = False

        try:
            self._downloadReport(page, fn)
            rslt = fn
        except Exception as err:
            print('Failed to download')        
            print(err)
                  
        page.close()
            
        return rslt
        
    def liveAnalysis(self):
        print('start live analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/live-analysis')
        page.wait_for_selector('table')

        fn = f'lv-{str(uuid4())}.xlsx'        
        rslt = False
        
        self._downloadReport(page, fn)
        rslt = fn
        
        try:
            self._downloadReport(page, fn)
            rslt = fn
        except Exception as err:
            print('Failed to download')        
            print(err)
                    
        page.close()
            
        return rslt
        
    def productAnalysis(self):
        print('start product analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/product-analysis')
        page.wait_for_selector('table')

        fn = f'pd-{str(uuid4())}.xlsx'        
        rslt = False
        try:
            self._downloadReport(page, fn)
            rslt = fn
        except Exception as err:
            print('Failed to download')        
            print(err)

        page.close()
            
        return rslt
        
    def marketingAnaylisis(self):
        print('start marketing analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/promotion-analytics')
        page.wait_for_selector('table')
        
        rslt = []
        # Check each martkering tools than download
        marketing_tools = ["Product Discount","Flash Deal","Shipping Fee Discount","Voucher","Buy More Save More"]
        for i, tool in enumerate(marketing_tools):
            page.locator("label").filter(has_text=tool).click()
            page.wait_for_timeout(500)
            
            fn = f'md-{str(uuid4())}.xlsx'        
            try:
                self._downloadReport(page, fn)
                rslt.append(fn)
            except Exception as err:
                print('Failed to download')        
                print(err)
                
        page.close()
        
        return rslt
    
    def cleanPages(self):
        new_page = self.createPage()
        for page in self.default_context.pages:
            if page == new_page:
                continue
            page.close()
            
        
    
if __name__ == "__main__":
    pws = TiktokAnalyticAuto(save_path='/home/mcimam/PersonalProject/Fyr/result',mode='prod')
    pws.loginSellerCenter()
    # pws.liveAnalysis()
    # pws.videoAnalysis()
    # pws.productAnalysis()
    # pws.marketingAnaylisis()
    # pws.cleanPages()
    del pws
    print('DONE')