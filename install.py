import sys
import os
import logging
from pathlib import Path
logging.basicConfig(stream=sys.stdout, level=logging.INFO)

abs_path = Path(__file__).parent.absolute()


# create playwright dictionary
if not os.path.exists(abs_path+'/playwright'):
   logging.info('Create playwright folder')
   os.makedirs(abs_path+'/playwright')
    
# create result dictionary
if not os.path.exists(abs_path+'/result'):
   logging.info('Create Result folder')
   os.makedirs(abs_path+'/result')
   
# copy config file
if not os.path.exists(abs_path+'src/config.py'):
    logging.info('Copy default config file to src/config.py, Please fill config file')
    if os.name == 'nt':
        cmd = f'copy {abs_path + "/src/config.py.example"} {abs_path + "/src/config.py"}'
    else:
        cmd = f'cp {abs_path + "/src/config.py.example"} {abs_path + "/src/config.py"}'
    os.system(cmd)

# install requirement
if os.path.exists('./requirements.txt'):
    logging.info('Install Python Depedency')
    os.system('pip install -r requirements.txt')
    # os.system('playwright install')

logging.info('-----------------------------------')
logging.info('Finish Installing Crawler')
logging.info('-----------------------------------')
logging.info('To start appliaction, please run python src/main.py')
logging.info('-----------------------------------')