const dotenv = require('dotenv');
const { getProductList } = require('./productList');
const { getProductDetail } = require('./productDetail');
const { getVideoData } = require('./videoCrawler');
const { getLiveData } = require('./liveCrawler');
dotenv.config();

(async() => {
    console.log('Start Crawling')
    await getProductList()
    await getProductDetail()
    await getVideoData()
    await getLiveData()
    console.log('Finish Crawling')
 
})()