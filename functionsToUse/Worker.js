const Functions = require('./functions')
class Worker{
    constructor({url,onRequest,onResponse}){
        logger.info(`URL DEL Worker ${url}`)
        this.url = url;
        this.onRequest = onRequest;
        this.onResponse = onResponse;
        this.workers = []
        this.maxWorkers = process.env.maxWorkers || 2
        this.startWorker()
    }

    async getWorker(){
        logger.info(`verificando si ya existe un worker para usar ${this.workers.length}`)
        await new Promise(resolve=>{
            const myInterval = setInterval(() => {
              // logger.info(`waiting for workers to use`)
              this.workers && this.workers.length > 0 ? (clearInterval(myInterval), resolve()) : null
            }, 1000);
        })
        logger.info(`existe un worker para usar`)
        const worker = this.workers.shift()
        logger.info(`enviando worker`)

        return worker
    }

    async startWorker(){
        const tasks = []

        for (let i = 0; i < this.maxWorkers; i++) {
            tasks.push(this.addWorker())
        }
        await Promise.all(tasks)
    }

    async addWorker(page){
        logger.info(`antes de agregar un worker`)
        if(page && page.tools){
            page.tools.pageCreatedSuccessfully = false

            const client = await page.target().createCDPSession()
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
        }
        const tools = page && page.tools || new Functions({url:this.url, onRequest:this.onRequest, onResponse:this.onResponse, page})
        await tools.initializePage()
        if(tools.pageCreatedSuccessfully){
            this.workers.push(tools)
            logger.info(`after add a worker length:${this.workers.length}`)
        }else{
            logger.info(`addWorker fail`)
            /* await */ this.addWorker()
        }

    }

    async getTools(tools) {
        tools ? null : logger.info(`available workers:${this.workers.length}`)
        tools ? null : logger.info(`before get new worker`)
        tools ? null : tools = await this.getWorker()
        logger.info(`worker obtenido`)
        tools ? null : logger.info(`tools logger id:${tools.logger.id}`)
        tools ? null : logger.refreshId(tools.logger.id)

        return tools
    }

    async checkToolsAndCreateNewIfNecessary({tools, reusePage=true}){
        let page;
        if(reusePage && tools.page && tools.page.reusePage){
            reusePage = false
        }else{
            reusePage ? (tools.page.reuseTimes = 1, page = tools.page, page.tools = tools) : tools.close()
            await this.addWorker(page)
            tools = null
        }

    }
}

module.exports = Worker