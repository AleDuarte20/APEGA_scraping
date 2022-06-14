logger = require('./generic-helper/Log').build()
const Settings = require('./Settings')
settings = Settings.build();

const functionsToUse = require('./functionsToUse/functions')
const Function = new functionsToUse(logger)
const maxPag = settings.max_search_pagination
// logger.info(`maxPage ${maxPag}`)
// const maxPag = 395;
let page;


async function onRequest(request){
    // logger.info(`requestURL: ${request.url()}`)
    
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
    block_url_regex.push('.*rum.')

    const foundToBlock = block_url_regex.filter(regexStr=> new RegExp(regexStr).test(request.url())).length

    if (!request.alreadyHandled && foundToBlock > 0){
        request.abort()
        request.alreadyHandled = true
    }  
}

async function onResponse(response){
    const url = response.url()
}

(async () => {
    logger.info('beggin run')
    for (let i = 1; i <= maxPag; i++) {
        // logger.info(`PAGE BEFORE CREATEPAGE ${page}`)
        if (page === undefined) {
            page = await Function.createPage(page, onRequest, onResponse)
        }
        
        await page.goto(`https://www.apega.ca/members/permit-holder-directory?page=${i}`,{waitUntil:`networkidle2`, timeout:80000});
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
        
        await page.waitForTimeout(1000)
        // await db.connect()
        if (data.length > 0) {
            await Function.saveData(data,page)
        }else{
            logger.info(`data lenght 0`)
        }
        // await db.disconnect()
        logger.info(`NEXT PAGE`);
    }
    
    logger.info(`END SCRAPING`);
    await browser.close();
})();