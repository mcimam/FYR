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

class LiveData(db.Entity):
    id = orm.PrimaryKey(int, auto=True)

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


if __name__ == "__main__":
    with orm.db_session:
        # log1 = FileLog(name='test')
        # orm.commit()
        FileLog.select()
