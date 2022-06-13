logger = require('./generic-helper/Log').build()
const Settings = require('./Settings')
settings = Settings.build();

const functionsToUse = require('./functionsToUse/functions')
const Function = new functionsToUse(logger)
const maxPag = settings.max_search_pagination
// logger.info(`maxPage ${maxPag}`)
// const maxPag = 395;

let page;

(async () => {
    logger.info('beggin run')
    for (let i = 1; i <= maxPag; i++) {
        // let url = `https://www.apega.ca/members/permit-holder-directory?page=${i}`
        page = await Function.createPage(page)
        
        await page.goto(`https://www.apega.ca/members/permit-holder-directory?page=${i}`,{waitUntil:`networkidle2`, timeout:80000});
        logger.info(`PAGE ${i}`);

        await page.waitForSelector('.service__item-title ')
        logger.info(`Extracting data from page ${i}`);
        await page.waitForTimeout(2000)

        let data = await Function.extractUsers(page)
        logger.info(`showing data extracted \n`);
        await page.waitForTimeout(1000)
        // logger.info(`data ${JSON.stringify(data,null,2)}`);
        logger.info(`data: ${data ? data.length : 'null'}`);

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