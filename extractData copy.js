const puppeteer = require('puppeteer');
const mongooseHelper = require('./generic-helper/MongooseHelper')
const db = new mongooseHelper('127.0.0.1:27017','Apega')
let datosModel = require('./Model/usersModel')

logger = require('./generic-helper/Log').build()
const Settings = require('./Settings')
settings = Settings.build();

// const maxPag = settings.max_search_pagination
const maxPag = 395;

async function saveData(data, page){
    const mongooseHelper = require('./generic-helper/MongooseHelper')
    const db = new mongooseHelper('127.0.0.1:27017','Apega')
    let datosModel = require('./Model/usersModel')

    logger.info(`INSIDE SAVEDATA`)
    try {
    await db.connect()
        for (let j=0; j < data.length; j++) {
            let item = data[j]
            // logger.info(`loading...`)

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
            // logger.info('antes de guardar los datos')
            await apegaDatos.save(function(error){
                if(error){
                    logger.info(`usuario ya existente ${error}`)
                }else{
                    logger.info(`se guardo este usuario ${item.name}`)
                }
            })
        }
    } catch (e) {
        logger.info(`error on save data ${e}`)
    }
    
    await db.disconnect()
}


(async () => {
    logger.info('beggin run')

    await db.connect()
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        defaultViewport: { width: 1366, height: 768 }
    });
    const page = await browser.newPage();

    for (let i = 1; i <= maxPag; i++) {

        
        await page.goto(`https://www.apega.ca/members/permit-holder-directory?page=${i}`,{waitUntil:`networkidle2`, timeout:80000});

        logger.info(`PAGE ${i}`);
        
        await page.waitForSelector('.service__item-title ')
        
        
        logger.info(`Extracting data from page ${i}`);
        await page.waitForTimeout(2000)

        let data = await page.evaluate(()=>{

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

        logger.info(`showing data extracted \n`);
        await page.waitForTimeout(1000)
        logger.info(`data ${JSON.stringify(data,null,2)}`);
        logger.info(`data: ${data.length}`);
        
        await page.waitForTimeout(1000)

        
        for (let j=0; j < data.length; j++) {
            let item = data[j]
            // logger.info(`loading...`)

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
            // logger.info('antes de guardar los datos')
            await apegaDatos.save(function(error){
                if(error){
                    logger.info(`usuario ya existente ${error}`)
                }else{
                    logger.info(`se guardo este usuario ${item.name}`)
                }
            })
        }

        // await saveData(data, page)
        
        
        
        logger.info(`NEXT PAGE`);
    }
    await db.disconnect()
    
    logger.info(`END SCRAPING`);
    await browser.close();

})();