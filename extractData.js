const puppeteer = require('puppeteer');
const mongooseHelper = require('./dbScraping/db')
const db = new mongooseHelper('127.0.0.1:27017','Apega')
let datosModel= require('./scrapingModel')
const maxPag = 395;
// const maxPag = 3;


(async () => {
    console.log('beggin run')
    

    const browser = await puppeteer.launch({
        headless: false,
        devtools: false,
        defaultViewport: { width: 1366, height: 768 }
    });
    const page = await browser.newPage();

    for (let i = 1; i <= maxPag; i++) {

        
        await page.goto(`https://www.apega.ca/members/permit-holder-directory?page=${i}`,{waitUntil:`networkidle2`});

        console.log(`PAGE ${i}`);
        
        await page.waitForTimeout(5000)
        
        
        console.log(`Extracting data from page=${i}`);
        await page.waitForTimeout(2000)

        let data = await page.evaluate(()=>{

            const lista = document.querySelectorAll('.service__item-title ');
            const subList =  document.querySelectorAll('.service__detail-list');


            // let apegaList = [];
            let apegaData = [];

            for (let i = 0; i < lista.length; i++) {
                
                let item = lista[i]
                // console.log(item)

                let item2 = subList[i]
                // console.log(item2)
                
                let name = item.querySelector('.service__item-link').innerText
                // name ? name = name.innerText : name = item.querySelector('.service__item-link .active').innerText
                console.log(name)
                
                let permitNumber = item2.querySelector('.service__detail-list li').innerText.split(':')[1].trim()
                // console.log(permitNumber)
                    
                let permitToPractice = item2.querySelector('.service__list li .service__detail-list li+li').innerText.split(':')[1].trim()
                // console.log(permitToPractice)
            
                let address = item2.querySelector('.service__list li .service__detail-list li+li+li').innerText.split(':')[1].trim()
                // console.log(address)
            
                let phoneNumber = item2.querySelector('.service__list li .service__detail-list li+li+li+li').innerText//.split(':')[1].trim()
                phoneNumber.includes('Phone') ? phoneNumber = phoneNumber.split(':')[1].trim() : phoneNumber ='Without Phone Number'
                // console.log(phoneNumber)
            
                let licenseDate = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li').innerText//.split(':')[1]
                licenseDate.includes('License') ? licenseDate = licenseDate.split(':')[1] : licenseDate = item2.querySelector('.service__list li .service__detail-list li+li+li+li').innerText.split(':')[1].trim()
                // console.log(licenseDate)
            
                let city =  item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li').innerText//.split(':')[1]
                city.includes('City') ? city = city.split(':')[1] : city = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li').innerText.split(':')[1].trim()
                // console.log(city)
            
                let postalCode = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li').innerText//.replace('\n','').split(':')[1]
                if(postalCode.includes('Postal Code')){
                    postalCode = postalCode.replace('\n','').split(':')[1]
                }else if(postalCode.includes('Province')){
                    postalCode = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li').innerText//.replace('\n','').split(':')[1]
                    postalCode.includes('City') ? postalCode = 'Whithout Postal Code' : postalCode = postalCode.replace('\n','').split(':')[1]
                }
                // console.log(postalCode )
            
                let province = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li+li')//.innerText
                if(province == null){
                    province = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li').innerText.replace('\n','').split(':')[1]
                }else if(province.innerText.includes('Responsible')){
                    province = item2.querySelector('.service__list li .service__detail-list li+li+li+li+li+li+li').innerText.replace('\n','').split(':')[1]
                }else if(province.innerText.includes('Province')){
                    province = province.innerText.replace('\n','').split(':')[1]
                }
                // console.log(province)
            
                let member = item2.querySelector('.service__list li a')
                member == null ? member = "No Responsible member" : member = member.innerText
                // console.log(member)

                apegaData.push({name,permitNumber,permitToPractice,address,phoneNumber,licenseDate,city,postalCode,province,member})

            } return apegaData  

        })

        console.log(`showing data extracted \n`);
        await page.waitForTimeout(1000)
        console.log(`data ${JSON.stringify(data,null,2)}`);
        // console.log(`data:`);
        
        
        await page.waitForTimeout(1000)
        
        await db.connect()

        try {
            for (let j=0; j < data.length; j++) {
                let item = data[j]
                // console.log(`loading...`)
    
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
                await page.waitForTimeout(1000)
                // console.log('antes de guardar los datos')
                await apegaDatos.save(function(error){
                    if(error){
                        console.log(`usuario ya existente ${error}`)
                    }else{
                        console.log(`se guardo este usuario ${item.name}`)
                    }
                })
            }
        } catch (e) {
            console.log(`saved data ${e}`)
        }

        await page.waitForTimeout(2000)
        await db.disconnect()

        console.log('datos guardados')
        
        
        console.log(`NEXT PAGE`);
    }
    
    console.log(`END SCRAPING`);
    await browser.close();

})();