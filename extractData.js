logger = require('./generic-helper/Log').build()
const Settings = require('./Settings')
settings = Settings.build();
const stageProduction = process.env.stage ? process.env.stage : process.env.stage === false
console.log(`stageProduction ${stageProduction}`)
const functionsToUse = require('./functionsToUse/functions')
const Function = new functionsToUse(logger)
const maxPag = settings.max_search_pagination
let i = 1;
// logger.info(`maxPage ${maxPag}`)
// const maxPag = 395;
// let page;


async function onRequest(request){}
async function onRequest1(request){
    // logger.info(`requestURL: ${request.url()}`)
    //todo: uno de estos recursos hace que funcione mal la pagina
    const block_url_regex = [];
    block_url_regex.push('.*?\.png')
    block_url_regex.push('.*?\.svg')
    block_url_regex.push('.*\.jpeg')
    block_url_regex.push('.*?\.css')
    block_url_regex.push('.*favicon\.ico')
    block_url_regex.push('.*googletagmanager.*')
    block_url_regex.push('.*Frontend.*')
    block_url_regex.push('.*beacon.*')
    block_url_regex.push('.*polyfill.*')
    // block_url_regex.push('.*rum.')

    const foundToBlock = block_url_regex.filter(regexStr=> new RegExp(regexStr).test(request.url())).length

    if (!request.alreadyHandled && foundToBlock > 0){
        request.abort()
        request.alreadyHandled = true
    }  
}

async function onResponse(response){
    const url = response.url()
}

async function retryPage(page,url){
    // async function retryPage(page,url,onRequest,onResponse){
    this.logger.info(`RETRY PAGE BECAUSE AN ERROR APPEARED`)
    await new Promise(resolve=>{
        setTimeout(()=>resolve(), 10000)
    })
    this.logger.info(`before close page retry browser:${page && page.browser() && !!page.browser()}`)
    try { await page.browser().close() } catch (error) {}

    return extractData(undefined,url)
}

async function extractData(page,url){ //todo cuando hace retryPage le suma +1 a i  COREGIR
// async function extractData(page,url){
    logger.info('beggin run')
    // logger.info(`URL recibida ${url}`)
        
    for (i; i <= maxPag;) {
        let url = `https://www.apega.ca/members/permit-holder-directory?page=${i}`
        // url += i
        logger.info(`URL PAGE: ${url}`)
        
        try {
            if (page === undefined) {
                page = await Function.createPage(page,onRequest,onResponse)
            }
            // `https://www.apega.ca/members/permit-holder-directory?page=${i}`
            await page.goto(url,{waitUntil:`networkidle2`, timeout:80000});
            logger.info(`PAGE ${i}`);

            await page.waitForSelector('.service__item-title ')
            logger.info(`Extracting data from page ${i}`);
            await page.waitForTimeout(2000)
            let data = await Function.extractUsers(page)
            logger.info(`showing data extracted \n`);
            await page.waitForTimeout(1000)
            // logger.info(`data ${JSON.stringify(data,null,2)}`);
            logger.info(`data: ${JSON.stringify(data)}`);
            // return

            if (data === undefined) {
               
                logger.info(`BEFORE RETRY EXTRACT DATA`)
                await retryPage(page,url+i)
                
            }else{
                
                await page.waitForTimeout(1000)
                // await db.connect()
                if (process.env.stage === true) {
                    logger.info(`BEFORE SAVEDATA`)
                    await Function.saveData(data,page)
                }
                // await db.disconnect()
                logger.info(`NEXT PAGE`);
                i++
                logger.info(`INCREMETENT COUNT:>>>>>>>>>>>>${i}<<<<<<<<<<<<<<<`)
            }
            
        } catch (e) {
            logger.info(`ERROR 102 ${e}`)
            // logger.info(`#################### URL93 ${url} ##################`)
            // await retryPage(page,undefined)
            await retryPage(page,url+i)
        }
        
    }
    logger.info(`END SCRAPING`);
    await browser.close();
};

module.exports = extractData