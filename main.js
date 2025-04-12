process.env.uuid = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)
const MongoHelper = require('./generic-helper/MongoHelper');
const db = new MongoHelper({ server: "localhost:27018", dbName: "Apega" });

async function removeDuplicateUsers() {
    const useDataFromDb = true
    let data;
    let apegaDatos;

    if (useDataFromDb == true) {
        await db.connect();
        apegaDatos = await db.db.collection("apegadatos")
    }
    data = await apegaDatos.find({}).toArray()
    // logger.info(`data JSON: ${JSON.stringify(data[0])}`)
    logger.info(`remove duplicates now`)
    data = data.reduce((previousValue, currentValue) => {
        let item = previousValue.findIndex(item =>
            item.CompanyID === currentValue.CompanyID &&
            item.PermitNumber === currentValue.PermitNumber &&
            item.LegalName === currentValue.LegalName &&
            item.FullPracticeDesignation === currentValue.FullPracticeDesignation &&
            item.AddressLine1 === currentValue.AddressLine1 &&
            item.City === currentValue.City &&
            item.Country === currentValue.Country &&
            item.Province === currentValue.Province &&
            item.ZipCode === currentValue.ZipCode &&
            item.DateIssued === currentValue.DateIssued &&
            item.PhoneNumber === currentValue.PhoneNumber &&
            item.ResponsibleMembers === currentValue.ResponsibleMembers
        );
        const exist = item != -1
        // logger.info(`exist? ${exist}`)
        exist ? null : previousValue.push(currentValue)
        return previousValue
    }, [])
    // logger.info(`data ${JSON.stringify(data)}`)
    logger.info(`data after remove duplicates: ${data.length}`)


    // return
    if (useDataFromDb == true) {
        logger.info(`db will be update`)
        await apegaDatos.deleteMany()
        await apegaDatos.insertMany(data)
        logger.info(`db was updated ${await apegaDatos.countDocuments()}`)
        await db.disconnect();
    }

}


async function testExtractDataWithFetch() {
    // logger.info(`run testExtractDataWithFetch`)
    process.env.maxWorkers = 1
    process.env.usePermitHolders = true
    const saveDataOnDb = true

    let tools;
    let url =`https://www.apega.ca/members/permit-holder-directory?page=1`

    const ExtractData = require('./extractData')
    let scraper = new ExtractData({ url })

    const Worker = require('./functionsToUse/Worker')
    const worker = new Worker({ url })

    scraper.tools = await worker.getTools(scraper.tools)
    do {
        logger.refreshId(scraper.tools.logger.id)
        await scraper.extractData(saveDataOnDb)
        if (scraper && scraper.executionError) {
            tools = scraper.tools
            scraper = new Worker({ url, onRequest, onResponse })

            await worker.checkToolsAndCreateNewIfNecessary({ tools: tools, reusePage: scraper.allReady ? true : false })
        }
        await new Promise(resolve => {
            setTimeout(() => resolve(), Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000)
        })

    } while (scraper.endScraper == false);
}


; (async () => {

    try {
        // await testExtractDataWithFetch();

        await removeDuplicateUsers();
    } catch (error) {
        console.log(error)
    }
})()