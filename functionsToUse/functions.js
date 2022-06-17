const puppeteer = require('puppeteer');
const mongooseHelper = require('../generic-helper/MongooseHelper')
const db = new mongooseHelper('127.0.0.1:27017','Apega')
let datosModel = require('../Model/usersModel')

const path = require('path');
const TorProxyHelper = require('../generic-helper/TorProxyHelper')
const torAxios = new TorProxyHelper()


class functions {
    constructor(logger){
        this.logger = logger
    }

    getLastVersionStaticResource(filenameRegExp){
        const fs = require('fs')
        const staticResourcesPath = path.join(__dirname, 'static-resources')
        // this.logger.info(`staticResourcesPath:${staticResourcesPath}`)
        let filenames;
        try {
        filenames = fs.readdirSync(staticResourcesPath).filter(item=> new RegExp(filenameRegExp).test(item)).map(item=>({filename:item, version:item.replace(/[^\d]/g, ''), mtime: fs.lstatSync(path.join(staticResourcesPath, item)).mtime.getTime()})).sort((a, b) => b.mtime - a.mtime)
        } catch (error) {
        this.logger.info(error)
        }
        this.logger.info(`########## filename:${filenames && filenames.length > 0 && filenames[0].filename}`)
        return filenames && filenames.length > 0 && filenames[0].filename
    }

    async createPage(page,onRequest,onResponse) {

        this.logger.info('INSIDE CREATE PAGE')
        const options = {
            headless: false,
            devtools: false,
            defaultViewport: { width: 1366, height: 768 },
            args:[]
        } 
        options.args.push('--disable-site-isolation-trials')
        options.args.push('--disable-features=site-per-process')
        options.args.push('--disable-web-security')
        // process.env.headless === 'true' ? options.args.push('--headless') : null
        if (process.platform === 'linux') {
            options.executablePath = `node_modules/puppeteer/.local-chromium/linux-991974/chrome-linux/chrome`
            options.args.push(`--remote-debugging-port=${80}`)
            options.args.push('--remote-debugging-address=0.0.0.0')
            options.args.push('--headless')
            options.args.push('--no-sandbox')   
        }
        // let browser = await puppeteer.launch(options);
        let browser = page ? page.browser() : await puppeteer.launch(options);
     
        const [tabOne] = await browser.pages();
        page = await browser.newPage();

        if(!page.waitForFunction) {
            page.waitForFunction = page.waitFor
            page.waitForTimeout = page.waitFor
        }

        try {
            await tabOne.close()
        } catch (error) {
            
        }

        await page.setRequestInterception(true);
        page.on('request', async request => {
        const fs = require('fs')
    
            request.alreadyHandled = false
    
            const block_ressources = ['image', 'manifest'];
            // const block_ressources = ['image', 'media',  'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset', 'manifest'];
    
            onRequest ? await onRequest(request) : null

            if(/.*Taxonomies.*/g.test(request.url())){ 
                const filename = this.getLastVersionStaticResource('Taxonomies.*')
                // this.logger.info(`filename:${filename}`)
                if(filename) {
                  const filePath = path.join(__dirname, "static-resources", filename)
                //   console.log(`file path:${filePath}`)
                  const fileStr = fs.readFileSync(filePath, "utf8")
                //   console.log(`file length:${fileStr.length}`)
                  if(fileStr) {
                      request.respond({
                        status: request.statusCode,
                        contentType: request.headers['content-type'],
                        "method": "GET",
                        body: fileStr
                    });
                    request.alreadyHandled = true
                  }
                }
            }

            if(/permitholders.*\.js/g.test(request.url())){ 
                const filename = this.getLastVersionStaticResource('permitholders.*\.js')
                // this.logger.info(`filename:${filename}`)
                if(filename) {
                  const filePath = path.join(__dirname, "static-resources", filename)
                //   console.log(`file path:${filePath}`)
                  const fileStr = fs.readFileSync(filePath, "utf8")
                //   console.log(`file length:${fileStr.length}`)
                  if(fileStr) {
                      request.respond({
                        status: request.statusCode,
                        contentType: request.headers['content-type'],
                        "method": "GET",
                        body: fileStr
                    });
                    request.alreadyHandled = true
                  }
                }
            }

            if(/.*base.*\.js/g.test(request.url())){ 
                const filename = this.getLastVersionStaticResource('.*base.*')
                // this.logger.info(`filename:${filename}`)
                if(filename) {
                  const filePath = path.join(__dirname, "static-resources", filename)
                //   console.log(`file path:${filePath}`)
                  const fileStr = fs.readFileSync(filePath, "utf8")
                //   console.log(`file length:${fileStr.length}`)
                  if(fileStr) {
                      request.respond({
                        status: request.statusCode,
                        contentType: request.headers['content-type'],
                        "method": "GET",
                        body: fileStr
                    });
                    request.alreadyHandled = true
                  }
                }
            }

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
            //             body: fileStr
            //         });
            //         request.alreadyHandled = true
            //       }
            //     }
            // }

            if (!request.alreadyHandled) {
                if (block_ressources.indexOf(request.resourceType()) !== -1) {
                    request.abort()
                }else{
                    // logger.info(`NO BLOCKED:${request.url()}`)
                    request.continue()
                }
                
            }
        });

        // page.on('response', (response) => {

        //   onResponse ? await onResponse(response) : null

        // })
        this.logger.info(`PAGE ALREADY CREATED`)

        return page;
    };


    async saveData(data, page){
        this.logger.info('INSIDE SAVEDATA')
        try {
            await db.connect()
            for (let j=0; j < data.length; j++) {
                let item = data[j]
                // this.this.logger.info(`loading...`)
    
                let apegaDatos = new datosModel({
                    name:item.name,
                    permitNumber:item.permitNumber ,
                    permitToPractice:item.permitToPractice ,
                    address:item.address ,
                    phoneNumber:item.phoneNumber ,
                    licenseDate:item.licenseDate ,
                    city:item.city ,
                    postalCode:item.postalCode ,
                    province:item.province ,
                    member:item.member
                    
                })
                await page.waitForTimeout(500)
                // this.logger.info('antes de guardar los datos')
                await apegaDatos.save(function(error){
                    if(error){
                        logger.info(`usuario ya existente ${error}`)
                        // console.log(`usuario ya existente ${error}`)
                    }else{
                        logger.info(`se guardo este usuario ${item.name}`)
                    }
                })
            }
            await page.waitForTimeout(1000)
            await db.disconnect()
        } catch (e) {
            this.logger.info(`error on save data ${e}`)
        }
        
    }

    async extractUsers(page){
        this.logger.info('INSIDE EXTRACT_USERS')
        try {
            
            let response = await page.evaluate(()=>{
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
            if (response.length == 0) {
                await this.retryPage(page)
            }
            return response

        } catch (e) {
            this.logger.info(`ERROR ${e}`)
        }
    }

   

} 
module.exports = functions