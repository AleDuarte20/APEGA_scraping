const MongooseHelper = require('./generic-helper/MongooseHelper');
const db = new MongooseHelper('localhost:27017','Apega');
const datosModel = require('./Model/usersModel');
process.env.uuid = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)
// process.env.proxy = `{"server":"gate.smartproxy.com", "port":7000, "username":"user-sp54d7e3b9-country-fr", "password":"yfllka6nf4rc"}`

let proxy = settings.proxy
process.env.proxy ? logger.info(process.env.proxy) : logger.info('proxy not exits')

logger = require('./generic-helper/Log').build();
const Settings = require('./Settings');
settings = Settings.build();

const TorProxyHelper = require('./generic-helper/TorProxyHelper')
const torAxios = new TorProxyHelper()

logger.info(`myproxy:${JSON.stringify(proxy)}`)
// logger.info(`TEST FOR LOGGER JEJE`)


async function testMongoose(){
    await db.connect();
    const list = await datosModel
    .find({
        // postalCode:"Without Postal Code",
        province:"BC"
    });
    await db.disconnect();
    logger.info((`list: ${JSON.stringify(list)}`));
    // logger.info((`list: ${JSON.stringify(list,null,2)}`));
    return list;
}

//for use this function you need change mongoose for mongoClient in MongooseHelper.js
async function testMongoClient(){
    await db.connect();
    const list = await db.db
    .collection('apegadatos')
    .find({
        // postalCode:"Without Postal Code",
        province:"BC"
    })
    // .limit(5)
    .toArray();
    await db.disconnect();
    logger.info((`list: ${JSON.stringify(list)}`));
    // logger.info((`list: ${JSON.stringify(list,null,2)}`));
    return list;
}

async function testRequestUsingTor() {
    const axios = require('axios');
    const SocksProxyAgent = require('socks-proxy-agent');
    const proxyOptions = `socks5://127.0.0.1:9050`;
    const httpsAgent = new SocksProxyAgent(proxyOptions);
    // const baseUrl = 'https://geo.captcha-delivery.com/captcha/?initialCid=AHrlqAAAAAMAyy7O69z6aWYAuWFOUQ%3D%3D&hash=05B30BD9055986BD2EE8F5A199D973&cid=WNeff9939M_qWFTvR6vg7nnd2vf3tbEC2SN0Zua_90OUG8Mnob5FQeK-l.AOd2~HP2LvR6do~BdJqjvzCQBnIy8iivPTjgjSTeM--fG~hk&t=fe&referer=https%3A%2F%2Fwww.leboncoin.fr%2Fvoitures%2F2032284647.htm&s=2089'
    const baseUrl = 'https://ipinfo.io/json'
    
    const response = await axios({
        httpsAgent,
        method:'GET',
        url:baseUrl,
    })
    logger.info(response.data)
}

async function testTorAxios() {
    // const response = await torAxios.request({
    //     method:'GET',
    //     url:`https://ipinfo.io/json`,
    //     // useTor:false
    // })

    const response = await torAxios.request({
        method:'GET',
        url:`https://ipinfo.io/json`,
        // headers,
        responseType: "buffer",
        withoutProxy:true
      })
    logger.info(`testGetCategoryLastPagination:${JSON.stringify(response.data)}`)
}

async function testExtractData(){
    const extractData = require('./extractData')
    let page;
    // let url =`https://www.apega.ca/members/permit-holder-directory?page=`

    // const results = await extractData(undefined,url)
    const results = await extractData(page,undefined)
}


;(async () =>{
    // await testMongoose();
    // await testMongoClient();
    // await testTorAxios();
    // await testRequestUsingTor();
    await testExtractData()
 })()