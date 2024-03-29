import os
from config import MODE, TT_UNAME, TT_PASSW
from models import *
from crawler import TiktokAnalyticAuto
from pathlib import Path
import logging
logging.basicConfig(format='[%(levelname)s] %(asctime)s - %(message)s', level=logging.INFO)

abs_path = Path(__file__).parent.absolute()

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
    logging.info(f'ABS PATH : {abs_path}')

    state_path = f'{abs_path}/../playwright/state.json'
    if os.path.exists(state_path):
        logging.info('Try to use exsisting context')
        pws = TiktokAnalyticAuto(save_path=f'{abs_path}/../result',mode=MODE, auth_state=state_path)
    else:
        pws = TiktokAnalyticAuto(save_path=f'{abs_path}/../result',mode=MODE)
    
    auth_state = pws.isAuthState()
    if not auth_state:
        pws.saveAuthState(username=TT_UNAME,password=TT_PASSW, path=state_path)
        
    pws.loginSellerCenter()
    pws.changeLanguage()

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
    
