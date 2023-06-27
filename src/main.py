from models import *
from crawler import TiktokAnalyticAuto

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
    print('START')    

    pws = TiktokAnalyticAuto(save_path='/home/mcimam/PersonalProject/Fyr/result',mode='dev')
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

    del pws

    print('DONE')    

if __name__ == "__main__":
    # Setup lof db
    db_setup(mode='dev')
    crawl_tiktok()
    