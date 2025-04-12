// logger = function() { console.log(`${new Date().toISOString().substr(0,19)} `, ...arguments)}
const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');
const HttpsProxyAgent = require("https-proxy-agent")

class TorProxyHelper {
    constructor () {
    }
    
    async connect () {
    }
    
    async request ({method, url, responseType, headers, data, useTor=true, withoutProxy=false}) {
        let response, proxy;
        // while(!response) {
            
            try {
                // logger.info(`TOR url:${url}`)
                process.env.proxy && typeof process.env.proxy === 'string' ? proxy = JSON.parse(process.env.proxy) : null
                // logger.info(`proxy:${JSON.stringify(proxy)}`)
                proxy && proxy.username ? proxy.username = `${proxy.username.replace(/-session.*/,'')}-session-${(Math.random() + 1).toString(36).substring(7)}-sessionduration-5` : null
                // logger.info(`proxy:${JSON.stringify(proxy)}`)
                
                this.proxyOptions ? null : this.proxyOptions = `socks5://127.0.0.1:${process.platform === "linux" ? 9050 : 9050}`;
                
                useTor ? this.httpsAgent = new SocksProxyAgent(this.proxyOptions) : null
                
                !useTor && proxy ? this.httpsAgent = new HttpsProxyAgent({host: proxy.server, port: proxy.port , auth: `${proxy.username}:${proxy.password}` }) : null 
                
                const options = {method, url, headers}
                withoutProxy ? null : options.httpsAgent=this.httpsAgent
                responseType ? options.responseType = responseType : null
                response = await axios(options, data)
            } catch (error) {
                logger.info(error)
                response = undefined
                logger.info(`method:${method} url:${url} responseType:${responseType} data:${data} useTor:${useTor} withoutProxy:${withoutProxy} headers:${headers}`)
                // await new Promise(resolve=>{
                //     setTimeout(()=>resolve(), Math.floor( Math.random() * (3000 - 1000 + 1) ) + 1000)
                // })
            }
        // }
        return response
    }

}

module.exports = TorProxyHelper