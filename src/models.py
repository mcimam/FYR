from config import DB_HOST,DB_NAME,DB_PASS,DB_USER,DB_PORT
from pony import orm
from datetime import datetime
import logging

db = orm.Database()

class FileLog(db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    name = orm.Required(str)
    type = orm.Optional(str)  # tipe: video;live;product;marketing
    status = orm.Optional(str, default='draft')  # status: draft;posted;failed
    create_at = orm.Required(datetime, default=lambda: datetime.now())
               
    def post(self):
        self.status = 'posted'

class Creator(db.Entity):
    id = orm.PrimaryKey(int, auto=False, size=64)
    name = orm.Optional(str)
    nickname = orm.Optional(str)
    live_ids =  orm.Set("LiveData")  
    video_ids = orm.Set("VideoData")
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    
    
class LiveData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    creator_id = orm.Required(Creator)
    launched_time = orm.Optional(datetime)
    duration = orm.Optional(int) # in second
    # Sales Performance
    revenue = orm.Optional(int)
    product_shown = orm.Optional(int) # product list in live
    order_created = orm.Optional(int)
    order_paid = orm.Optional(int)
    unit_sales = orm.Optional(int)
    buyer =orm.Optional(int)
    avg_price = orm.Optional(int)
    co_rate = orm.Optional(int)
    impression = orm.Optional(int)
    product_click = orm.Optional(int)
    ctr = orm.Optional(float)
    # Live Performance
    viewer = orm.Optional(int)
    view = orm.Optional(int)
    acu = orm.Optional(int)
    pcu = orm.Optional(int)
    avg_view_duration = orm.Optional(int)
    comment = orm.Optional(int)
    share = orm.Optional(int)
    like = orm.Optional(int)
    new_follower = orm.Optional(int)
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    
    
class Product(db.Entity):
    id = orm.PrimaryKey(int,auto=False, size=64)
    name = orm.Required(str)
    data_ids = orm.Set("ProductData")
    video_data_ids = orm.Set("VideoData")
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    

class ProductData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    product = orm.Required(Product)
    revenue = orm.Optional(int)
    buyer =orm.Optional(int)
    sale = orm.Optional(int)
    order = orm.Optional(int)
    # Livestream source
    live_buyer =orm.Optional(int)
    live_sale = orm.Optional(int)
    live_viewer = orm.Optional(int)
    live_click = orm.Optional(int)
    live_impression = orm.Optional(int)
    live_ctr = orm.Optional(float)
    live_co = orm.Optional(float)
    # Video source
    video_buyer =orm.Optional(int)
    video_sale = orm.Optional(int)
    video_viewer = orm.Optional(int)
    video_click = orm.Optional(int)
    video_impression = orm.Optional(int)
    video_ctr = orm.Optional(float)
    video_co = orm.Optional(float)
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    


class Video(db.Entity):
    id = orm.PrimaryKey(int,auto=False, size=64)
    info = orm.Required(str)  
    data_ids = orm.Set("VideoData")
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    


class VideoData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    creator_id = orm.Required(Creator)
    video_id = orm.Optional(Video)
    time = orm.Optional(datetime)
    product = orm.Optional(Product)
    revenue = orm.Optional(int)
    buyer =orm.Optional(int)
    sale = orm.Optional(int)
    order = orm.Optional(int)
    commission = orm.Optional(int)
    refund = orm.Optional(int)
    product_refund = orm.Optional(int)
    co = orm.Optional(float)
    ctr = orm.Optional(float)
    vv = orm.Optional(int)
    like = orm.Optional(int)
    comment = orm.Optional(int)
    share = orm.Optional(int)
    impression = orm.Optional(int)
    click = orm.Optional(int)
    new_follower = orm.Optional(int)
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    
    
class SaleData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    
    
class MarketingData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)
    create_at = orm.Required(datetime, default=lambda: datetime.now())
    


def db_setup(mode=None):
    ''' setup db connection
        :param mode dev,None   
    '''
    # if db.provider is not None:
    #     return db
    
    if mode == 'dev':
        db.bind(provider='sqlite', filename='db.sqlite', create_db=True)
        orm.pony.options.CUT_TRACEBACK = False
        #orm.set_sql_debug(True)
    else:
        logging.info(f'Binding database {DB_HOST} ')
        db.bind(provider='postgres', user=DB_USER, password=DB_PASS, host=DB_HOST, database=DB_NAME, port=DB_PORT)
        logging.info('Bind database success')

    db.generate_mapping(create_tables=True)
    return db


