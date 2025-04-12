const puppeteer = require('puppeteer');
const MongoHelper = require('../generic-helper/MongoHelper');
const db = new MongoHelper({server:"localhost:27018", dbName:"Apega"});
let datosModel = require('../Model/usersModel');

const path = require('path');
const TorProxyHelper = require('../generic-helper/TorProxyHelper');
const torAxios = new TorProxyHelper();


class Functions {
    constructor({url, page, browser, onRequest, onResponse}){
        this.logger = require('../generic-helper/Log').build((Math.random() + 1).toString(36).substring(7));
        this.url = url
        this.url = `https://www.apega.ca/members/permit-holder-directory?page=1`
        this.page = page;
        this.browser = browser;
        this.onRequest = onRequest
        this.onResponse = onResponse
        this.pageCreatedSuccessfully  = false 
    }

    async initializePage(){
        try {
            //creating page
            await this.createPage()
            // this.logger.info(`before goto`)
            await this.page.goto(this.url, { waitUntil: ['load', 'domcontentloaded'/* , 'networkidle2' */], timeout:80000})

            await this.randomWait()
            
            // const captchaExists = await this.page.evaluate(()=>document.querySelector('#npTA3') !== null)
            // this.logger.info(`captcha exist? ${captchaExists}`)

            // await this.page.waitForTimeout(100000)
            this.logger.info(`after verify if page is ready to use`)
            await this.checkPageReadyToUse()

            // if(await this.checkPageReadyToUse()) return

        } catch (error) {
            this.logger.info()            
        }
    }

    async checkPageReadyToUse() {
        this.pageCreatedSuccessfully ? null : this.pageCreatedSuccessfully = await this.page.evaluate(()=>document.querySelector('#WSnl4') !== null)
        this.logger.info(`pageCreatedSuccessfully:${this.pageCreatedSuccessfully}`)
        return this.pageCreatedSuccessfully
    }

    getLastVersionStaticResource(filenameRegExp){
        const fs = require('fs');
        const staticResourcesPath = path.join(__dirname, 'static-resources');
        // this.logger.info(`staticResourcesPath:${staticResourcesPath}`);
        let filenames;
        try {
        filenames = fs.readdirSync(staticResourcesPath).filter(item=> new RegExp(filenameRegExp).test(item)).map(item=>({filename:item, version:item.replace(/[^\d]/g, ''), mtime: fs.lstatSync(path.join(staticResourcesPath, item)).mtime.getTime()})).sort((a, b) => b.mtime - a.mtime);
        } catch (error) {
        this.logger.info(error);
        }
        this.logger.info(`########## filename:${filenames && filenames.length > 0 && filenames[0].filename}`);
        return filenames && filenames.length > 0 && filenames[0].filename;
    }

    // async createPage(page,onRequest,onResponse) {
    async createPage() {

        this.logger.info('INSIDE CREATE PAGE');
        this.logger.info(`OS: ${process.platform}`);
        const options = {
            headless: false,
            // devtools: true,
            // defaultViewport: { width: 1366, height: 768 },
            args:[]
        } 
        options.args.push('--disable-site-isolation-trials');
        options.args.push('--disable-features=site-per-process');
        options.args.push('--disable-web-security');
        // process.env.headless === 'true' ? options.args.push('--headless') : null
        if (process.platform === 'linux') {
            // options.executablePath = `node_modules/puppeteer/.local-chromium/linux-991974/chrome-linux/chrome`;
            // options.args.push(`--remote-debugging-port=${80}`)
            // options.args.push('--remote-debugging-address=0.0.0.0');
            // options.args.push('--headless');
            options.args.push('--no-sandbox');
        }
        // let browser = await puppeteer.launch(options);
        this.browser = this.page ? this.page.browser() : await puppeteer.launch(options);
     
        const emptyPages = await this.browser.pages();
        if(!this.page){
            this.page = await this.browser.newPage();
            // await this.onRequestHandler()
        }

        if(emptyPages && emptyPages.length) {
            this.logger.info(`removing unused browser tabs`)
            for (let i = 0; i < emptyPages.length; i++) {
              const tab = emptyPages[i];
              try { await tab.close() } catch (error) {}
            }
          }

        // if(!this.page.waitForFunction) {
        //     this.page.waitForFunction = this.page.waitFor;
        //     this.page.waitForTimeout = this.page.waitFor;
        // }

        // try {
        //     await emptyPages.close();
        // } catch (error) {
            
        // }

        this.logger.info(`PAGE ALREADY CREATED`);

        return this.page;
    };

    async onRequestHandler(){
        await this.page.setRequestInterception(true);
        this.page.on('request', async request => {
            const fs = require('fs');
    
            request.alreadyHandled = false;
    
            const block_ressources = ['image', 'manifest'];
            // const block_ressources = ['image', 'media',  'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset', 'manifest'];
    
            this.onRequest ? await this.onRequest(request) : null;

            if(/.*Taxonomies.*/g.test(request.url())){ 
                const filename = this.getLastVersionStaticResource('Taxonomies.har');
                // this.logger.info(`filename:${filename}`);
                if(filename) {
                  const filePath = path.join(__dirname, "static-resources", filename);
                //   console.log(`file path:${filePath}`);
                  const fileStr = fs.readFileSync(filePath, "utf8");
                //   console.log(`file length:${fileStr.length}`);
                  if(fileStr) {
                      request.respond({
                        status: request.statusCode,
                        contentType: request.headers['content-type'],
                        "method": "GET",
                        body: fileStr
                    });
                    request.alreadyHandled = true;
                  }
                }
            }

            if(/permitholders.*\.js/g.test(request.url())){ 
                const filename = this.getLastVersionStaticResource('permitholders.*\.js');
                // this.logger.info(`filename:${filename}`);
                if(filename) {
                  const filePath = path.join(__dirname, "static-resources", filename);
                //   console.log(`file path:${filePath}`);
                  const fileStr = fs.readFileSync(filePath, "utf8");
                //   console.log(`file length:${fileStr.length}`);
                  if(fileStr) {
                      request.respond({
                        status: request.statusCode,
                        contentType: request.headers['content-type'],
                        "method": "GET",
                        body: fileStr
                    });
                    request.alreadyHandled = true;
                  }
                }
            }

            if(/.*base.*\.js/g.test(request.url())){ 
                const filename = this.getLastVersionStaticResource('.*base.*');
                // this.logger.info(`filename:${filename}`);
                if(filename) {
                  const filePath = path.join(__dirname, "static-resources", filename);
                //   console.log(`file path:${filePath}`);
                  const fileStr = fs.readFileSync(filePath, "utf8");
                //   console.log(`file length:${fileStr.length}`);
                  if(fileStr) {
                      request.respond({
                        status: request.statusCode,
                        contentType: request.headers['content-type'],
                        "method": "GET",
                        body: fileStr
                    });
                    request.alreadyHandled = true;
                  }
                }
            }
            // no se puede bloquer && no se puede descargar el archivo para pasarle && falta por tor
            // if(/.*Register\/PermitHolders.*/g.test(request.url())){ 

            //     const filename = this.getLastVersionStaticResource('PermitHolder\.har')
            //     // this.logger.info(`filename:${filename}`)
            //     if(filename) {
            //       const filePath = path.join(__dirname, "static-resources", filename)
            //     //   console.log(`file path:${filePath}`)
            //       const fileStr = fs.readFileSync(filePath, "utf8")
            //     //   console.log(`file length:${fileStr.length}`)
            //       if(fileStr) {
            //           request.respond({
            //             status: request.statusCode,
            //             contentType: request.headers['content-type'],
            //             "method": "GET",
            //             body:fileStr
            //         });
            //         request.alreadyHandled = true
            //       }
            //     }
            // }

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

            if (!request.alreadyHandled) {
                if (block_ressources.indexOf(request.resourceType()) !== -1) {
                    request.abort();
                }else{
                    logger.info(`NO BLOCKED:${request.url()}`);
                    request.continue();
                }
                
            }
        });
    }

    //this is using mongoose
    async saveData(apegaResults, page){
        this.logger.info('INSIDE SAVEDoTA')
        // this.logger.info(`this is data received ${apegaResults}`)
        try {
            await db.connect()
            for (let j=0; j < apegaResults.length; j++) {
                let item = apegaResults[j]
                delete item["PublicName"] && delete item["AddressLine2"] && delete item["AddressLine3"] && delete item["PhoneExtension"]
                // this.this.logger.info(`loading...`)
    
                let apegaDatos = new datosModel({
                    AddressLine:item.AddressLine,
                    City:item.City,
                    CompanyID:item.CompanyID,
                    Country:item.Country,
                    DateIssued:item.DateIssued,
                    FullPracticeDesignation:item.FullPracticeDesignation,
                    LegalName:item.LegalName,
                    PermitNumber:item.PermitNumber,
                    PhoneAreaCode:item.PhoneAreaCode,
                    PhoneCountryCode:item.PhoneCountryCode,
                    PhoneNumber:item.PhoneNumber,
                    Province:item.Province,
                    ResponsibleMember:item.ResponsibleMembers[0].Title,
                    ZipCode:item.ZipCode,
                })
                await page.waitForTimeout(500)
                // logger.info('antes de guardar los datos')
                await apegaDatos.save(function(error){
                    if(error){
                        logger.info(`usuario ya existente ${error}`)
                        // console.log(`usuario ya existente ${error}`)
                    }else{
                        logger.info(`se guardo este usuario ${item.LegalName}`)
                    }
                })
            }
            await page.waitForTimeout(1000)
            await db.disconnect()
        } catch (e) {
            this.logger.info(`error on save data ${e}`)
        }
        
    }
    //this is using mongodb
    async saveData2(data,saveData){
        try {
            await db.connect()    
            logger.info(`before delete empty values`)
            let dataReadyToSave = await this.deletingEmptyValuesAndModifiedSomeProperties(data)
            
            logger.info(`before save data on db`)
            if(saveData === true){await db.db.collection('apegadatos').insertMany(dataReadyToSave);}
            logger.info(`after save data on db`)
            // logger.info(`dataReadyToSave ${JSON.stringify(dataReadyToSave)}`)
            await db.disconnect()
        } catch (error) {
            this.logger.info(error)
        }
        
    }

    async deletingEmptyValuesAndModifiedSomeProperties(data){
        const results = []
        this.logger.info(`starting to delete`)
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            const emptyKeys = Object.keys(item).map(key=>{
                if(item[key] == "") delete item[key]
            })
            results.push(item)
        }
        return results
    }

    async extractUsers(page){
        this.logger.info('INSIDE EXTRACT_USERS')
        try {
            
            let response = await this.page.evaluate(()=>{
                const lista = document.querySelectorAll('.service__item-title ');
                const subList =  document.querySelectorAll('.service__detail-list');
                let apegaData = [];
                for (let i = 0; i < lista.length; i++) {
                    
                    let item = lista[i]
                    // logger.info(item)
    
                    let item2 = subList[i]
                    // logger.info(item2)
                    
                    let name = item.querySelector('.service__item-link').innerText
                    // name ? name = name.innerText : name = item.querySelector('.service__item-link .active').innerText
                    // logger.info(name)
                    
                    let permitNumber = item2.querySelector('.service__detail-list li').innerText.split(':')[1].trim()
                    // logger.info(permitNumber)
                        
                    let permitToPractice = item2.querySelector('.service__list li .service__detail-list li+li').innerText.split(':')[1].trim()
                    // logger.info(permitToPractice)
                
                    let address = item2.querySelector('.service__list li .service__detail-list li+li+li').innerText.split(':')[1].trim()
                    // logger.info(address)
                
                    let phoneNumber = item2.querySelector('.service__list li .service__detail-list li+li+li+li').innerText//.split(':')[1].trim()
                    phoneNumber.includes('Phone') ? phoneNumber = phoneNumber.split(':')[1].trim() : phoneNumber ='Without Phone Number'
                    // logger.info(phoneNumber)
                
                    let licenseDate = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li').innerText//.split(':')[1]
                    licenseDate.includes('License') ? licenseDate = licenseDate.split(':')[1] : licenseDate = item2.querySelector('.service__list li .service__detail-list li+li+li+li').innerText.split(':')[1].trim()
                    // logger.info(licenseDate)
                
                    let city =  item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li').innerText//.split(':')[1]
                    city.includes('City') ? city = city.split(':')[1] : city = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li').innerText.split(':')[1].trim()
                    // logger.info(city)
                
                    let postalCode = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li').innerText//.replace('\n','').split(':')[1]
                    if(postalCode.includes('Postal Code')){
                        postalCode = postalCode.replace('\n','').split(':')[1]
                    }else if(postalCode.includes('Province')){
                        postalCode = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li').innerText//.replace('\n','').split(':')[1]
                        postalCode.includes('City') ? postalCode = 'Whithout Postal Code' : postalCode = postalCode.replace('\n','').split(':')[1]
                    }
                    // logger.info(postalCode )
                
                    let province = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li+li')//.innerText
                    if(province == null){
                        province = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li').innerText.replace('\n','').split(':')[1]
                    }else if(province.innerText.includes('Responsible')){
                        province = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li').innerText.replace('\n','').split(':')[1]
                    }else if(province.innerText.includes('Province')){
                        province = province.innerText.replace('\n','').split(':')[1]
                    }
                    // logger.info(province)
                
                    let member = item2.querySelector('.service__list li a')
                    member == null ? member = "No Responsible member" : member = member.innerText
                    // logger.info(member)
    
                    apegaData.push({name,permitNumber,permitToPractice,address,phoneNumber,licenseDate,city,postalCode,province,member})
    
                } return apegaData  
            })
            this.logger.info(`response ${response}`)
            if (response.length == 0) {
                await this.retryPage()
                // await this.retryPage(page)
            }
            return response

        } catch (e) {
            this.logger.info(`ERROR ${e}`)
        }
    }

    async randomWait({max=2000, min=500} = {}) {
        await this.page.waitForTimeout(Math.random() * (max - min) + min)
    }

} 

module.exports = Functions