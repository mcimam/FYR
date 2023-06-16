from models import *
from crawler import TiktokAnalyticAuto

@orm.db_session
def crawl_tiktok():
    # Tiktok analysis will generate file
    # We then register each file inside logs
    print('START')    

    pws = TiktokAnalyticAuto(save_path='/home/mcimam/PersonalProject/Fyr/result',mode='dev')
    pws.loginSellerCenter()

    lf = pws.liveAnalysis()
    FileLog(name=lf, type='video')

    vf = pws.videoAnalysis()
    FileLog(name=vf, type='live')

    pf = pws.productAnalysis()
    FileLog(name=pf, type='sale')
    
    mfs = pws.marketingAnaylisis()
    for mf in mfs:
        FileLog(name=mf, type='marketing')

    del pws

    print('DONE')    

if __name__ == "__main__":
    # Setup lof db
    db_setup(mode='dev')
    crawl_tiktok()