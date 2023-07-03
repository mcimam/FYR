from playwright.sync_api import sync_playwright
from uuid import uuid4
import re
import logging

class SkipCrawlException(Exception):
    pass

class TiktokAnalyticAuto:
    def __init__(self,save_path='./', mode='dev', no_download=False, auth_state=None) -> None:
        logging.info('Create Playwright instance')
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
            self.browser = self.pw.chromium.launch_persistent_context('/home/mcimam/snap/chromium/common/chromium/Default', headless=False, accept_downloads=True)
            self.default_context = self.browser 
            # self.default_context = self.browser.new_context()
            self.contexts = [self.default_context]
            
        # if auth_state:
        #     self.default_context = self.browser.new_context(storage_state=auth_state)
            
        self.active_page = None
    
    def __del__(self) -> None:
        logging.info('Delete playwright instance')
        if self.mode != 'dev':
            self.browser.close()
            
        self.pw.stop()
   
    def createPage(self) -> object:
        logging.info('Create new page')
        page =  self.default_context.new_page()
        self.active_page = page
        return page
    
    def loginSellerCenter(self):
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/account/login')
        page.wait_for_timeout(1000)
        if page.url != 'https://seller-id.tiktok.com/account/login':
            page.close()
            logging.info('Already Login')
            return
        
        page.wait_for_selector('button')
        page.get_by_role("button", name="Log in with TikTok account").click()
        page.wait_for_selector('button')
        page.locator('#auth-btn').click()
        try:
            page.wait_for_url("**/homepage*")
        finally:
            logging.info('Log In')
            page.close()
 
    def _downloadReport(self, page=None, filename=None, language='en'):
        if not page:
            page = self.active_page
    
        page.wait_for_timeout(500)

        if language=='id':
            text_metrics = 'Metrik'
            text_metrics_save = 'Simpan'
            text_download = 'Unduh'
        else:
            text_metrics = 'Metrics'
            text_metrics_save = 'Save'
            text_download = 'Export'

        metrics_button = page.locator(f'xpath=//button[contains(., {text_metrics})]')
        if metrics_button.is_visible():
            metrics_button.click()
            page.wait_for_selector('.zep-modal-content', timeout=1000)
        
            elements = page.query_selector_all('label.zep-checkbox')
            for element in elements:
                if not element.query_selector('input.zep-checkbox-input').is_checked():
                    element.click()
        
            save_button = page.locator((f'xpath=//button[contains(., "{text_metrics_save}")]'))
            if not save_button.is_disabled():
                save_button.click()
            else:
                # Click Cancel Button
                page.locator("footer button").first.click()

            page.wait_for_timeout(500)            
        
        try:
            export_button = page.get_by_role("button", name=text_download)
            
            if export_button.is_disabled():
                raise SkipCrawlException('Export Button Is Disabled') 
            
            # Download by clicking export
            with page.expect_download() as download_info:
                export_button.click()
                # page.wait_for_timeout(500)
    
            download = download_info.value
    
        except SkipCrawlException as err:
            logging.error(err)
        
        except:
            logging.info('retry download')
            with page.expect_download() as download_info:
            
                list_button = page.locator("div").filter(has_text=re.compile(r"^Export")).get_by_role("button").nth(1)
                list_button.click()
                
                redownload_button = page.get_by_role("button", name="Download")
                redownload_button.first.click()
                
                download = download_info.value
                 
        if not filename:
            filename = download.suggested_filename
                
        download.save_as(f"{self.sp}/{filename}")
        logging.info(f'Download "{filename}" Success')

    def videoAnalysis(self):
        logging.info("Start video analysis")
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/video-analytics')
        page.wait_for_selector('table')

        fn = f'vd-{str(uuid4())}.xlsx'        
        rslt = False

        try:
            self._downloadReport(page, fn)
            rslt = fn
        except Exception as err:
            logging.error('Failed to download')
            logging.error(err)
                  
        page.close()
            
        return rslt
        
    def liveAnalysis(self):
        logging.info('Start live analysis')
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
            logging.error('Failed to download')
            logging.error(err)
                    
        page.close()
            
        return rslt
        
    def productAnalysis(self):
        logging.info('Start product analysis')
        page = self.createPage()
        page.goto('https://seller-id.tiktok.com/compass/product-analysis')
        page.wait_for_selector('table')

        fn = f'pd-{str(uuid4())}.xlsx'        
        rslt = False
        try:
            self._downloadReport(page, fn)
            rslt = fn
        except Exception as err:
            logging.error('Failed to download')
            logging.error(err)

        page.close()
            
        return rslt
        
    def marketingAnaylisis(self):
        logging.info('Start marketing analysis')
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
                logging.error('Failed to download')
                logging.error(err)
                
        page.close()
        
        return rslt
    
    def cleanPages(self):
        new_page = self.createPage()
        for page in self.default_context.pages:
            if page == new_page:
                continue
            page.close()
            
    def saveAuthState(self, username, password, path):
        logging.info('Start save auth state')
        page = self.createPage()
        page.goto('https://www.tiktok.com/login/phone-or-email/email')
        page.get_by_placeholder("Email or username").fill(username)
        page.get_by_placeholder("Password").fill(password)
        page.get_by_role("button", name="Log in").click()
        logging.warning('Please Solve Captcha')
        page.wait_for_timeout(20000)
        page.context.storage_state(path=path)       
        page.close()
        
    def isAuthState(self):
        logging.debug('Test login page')
        page = self.createPage()
        page.goto('https://www.tiktok.com/setting')
        page.wait_for_timeout(1000)
        if page.url == 'https://www.tiktok.com/setting':
            page.close()
            logging.debug('Test Result True')
            return True
        page.close()
        return False