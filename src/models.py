from pony import orm
from datetime import datetime

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
  

class VideoData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)

class SaleData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)

class ProductData(db.Entity):
    id = orm.PrimaryKey(int, auto=False)
    
class MarketingData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)


def db_setup(mode=None):
    ''' setup db connection
        :param mode dev,None   
    '''
    if mode == 'dev':
        db.bind(provider='sqlite', filename='db.sqlite', create_db=True)
        # orm.set_sql_debug(True)
    else:
        db.bind(provider='postgres', user='mcimam', password='root', host='194', database='')

    db.generate_mapping(create_tables=True)
    return db


