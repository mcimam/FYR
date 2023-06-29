from config import MODE, TT_UNAME, TT_PASSW
from models import *
from crawler import TiktokAnalyticAuto
import logging
logging.basicConfig(format='[%(levelname)s] %(asctime)s - %(message)s', level=logging.INFO)

@orm.db_session
def logFile(name, type):
    if not isinstance(name, str):
        return False
    
    fl = FileLog(name=name, type=type)
    orm.commit()
    return fl

def crawl_tiktok():
    # Tiktok analysis will generate file
    # We then register each file inside logs
    logging.info('Start Crawling')
    
    pws = TiktokAnalyticAuto(save_path='../result',mode=MODE)
    if not pws.testAuthState():
        pws.saveAuthState(username=TT_UNAME,password=TT_PASSW, path='../playwright/state.json')
    else:
        pws.default_context = pws.browser.new_context(storage_state='../playwright/state.json')
        
    pws.loginSellerCenter()

    lf = pws.liveAnalysis()
    logFile(name=lf, type='video')

    vf = pws.videoAnalysis()
    logFile(name=vf, type='live')

    pf = pws.productAnalysis()
    logFile(name=pf, type='sale')
    
    mfs = pws.marketingAnaylisis()
    for mf in mfs:
        logFile(name=mf, type='marketing')
    
    pws.cleanPages()
    logging.info('Finish Crawling')

    del pws

 
if __name__ == "__main__":
    logging.info('Start')
    # Setup lof db
    logging.info(f'Init DB Setup {MODE}')
    db_setup(mode=MODE)
    crawl_tiktok()
    