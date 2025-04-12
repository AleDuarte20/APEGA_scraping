// logger = require('./generic-helper/Log').build()
// const Settings = require('./Settings')
// settings = Settings.build();
// const stageProduction = process.env.stage ? process.env.stage : process.env.stage === true
const { abort } = require('process')
const functionsToUse = require('./functionsToUse/functions')
const tools = new functionsToUse(logger)
// const mongooseHelper = require('./generic-helper/MongoHelper');
// const db = new mongooseHelper('127.0.0.1:27017','Apega');
// let datosModel = require('./Model/usersModel');
// const maxPag = settings.max_number_pagination
// let i = 1;
// logger.info(`maxPage ${maxPag}`)
// logger.info(`contador ${i}`)
// const maxPag = 395;
// let page;

class ExtractData {
    constructor({ url, tools }) {
        this.url = url
        this.tools = tools
        this.usePermitHolders = process.env.usePermitHolders ? process.env.usePermitHolders : false
        this.skip = 0
        this.top = 500
        this.endScraper = false
        // this.saveDataOnDb = process.env.saveDataOnDb ? process.env.saveDataOnDb : false
        logger.info(`usePermitHolders:${this.usePermitHolders} && skip value: ${this.skip}`)

    }

    async onRequest(request) {

    }

    async onResponse(response) {

    }



    async extractData(saveDataOnDb) {
        // async extractData(page,url,saveData){ 
        if (this.usePermitHolders == false) return
        logger.info(`beggin run and save Data info: ${saveDataOnDb}`)
        let apegaResults;
        // let skip = 0
        try {
            logger.info(`before call permitHolders api`)
            await this.tools.page.waitForTimeout(3000)
            try {

                apegaResults = await this.tools.page.evaluate(async ({ top, skip, usePermitHolders }) => {
                    let response = await fetch(`https://ods.apega.ca/odata/v1/Register/PermitHolders?$count=true&$top=${top}&$skip=${skip}&$expand=ResponsibleMembers,PermitOperatingAsNames&$orderby=LegalName`, {
                        "headers": {
                            "Accept": "*/*",
                            "Accept-Language": "en-US,en;q=0.5",
                        }
                    });
                    response = await response.json()
                    const maxUserQuantity = response["@odata.count"]
                    response = response.value
                    // response = JSON.parse(response)
                    if (skip < maxUserQuantity && response && response.length > 0) {
                        return response
                    }else{
                        response = [{}]
                    }
                }, { top: this.top, skip: this.skip, usePermitHolders: this.usePermitHolders/*, maxUserQuantity:maxUserQuantity */ })
                logger.info(`Resultados del fetch ${apegaResults ? JSON.stringify(apegaResults.length) : "no more users to extract"}`)

                this.endScraper = !apegaResults ? true : false
                if (apegaResults) {
                    logger.info(`increase skip`)
                    this.allReady = true
                    this.skip += 500
                    if (saveDataOnDb == true && apegaResults) {
                        logger.info(`before call saveData function `)
                        await tools.saveData2(apegaResults, saveDataOnDb)
                        // await this.saveData(apegaResults,this.page)
                    }
                } else {
                    logger.info(`end scraping because no exits more users to extract`)
                    await this.tools.browser.close()
                }

            } catch (error) {
                logger.info(error)
            }

        } catch (error) {
            this.executionError = true
            logger.info(error)
        }
        return apegaResults
    };
}

module.exports = ExtractData
// export {extractData,retryPage}