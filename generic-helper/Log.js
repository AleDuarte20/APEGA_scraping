const moment = require('moment')
// process.env.uuid = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)

class Log {
    constructor(){
        this.log4js = require('log4js')
        // this.id = null
    }

    static build(functionId) {
        const fileName = `logs_machine_${process.env.uuid}`
        const logger = new Log()
        logger.id = functionId
        let appendersName = [fileName]
        let appenders = {    }
        appenders[fileName] = {
          type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log',
          maxLogSize: 10485760, backups: 3, compress: true
        },
        logger.log4js.configure({
          pm2: true,
          disableClustering: true,
          appenders: appenders,
          categories: {
            default: { appenders: appendersName, level: 'debug'}
          }
        })
        logger.logs = logger.log4js.getLogger(fileName)
        return logger
      }

    info(message) {
        // settings.debug ? (console.log(`${moment().format('YYYYMMDD HH:mm:ss.SSSSSS')} ${process.env.uuid} ${message}`), this.logs.info(`${process.env.uuid} ${message}`)) : null
        //este es para guardar los logs en una carpeta
        // console.log(`${moment().format('YYYYMMDD HH:mm:ss.SSSSSS')} ${process.env.uuid} ${this.id ? this.id : '   '} ${message}`), this.logs.info(`${process.env.uuid} ${message}`)
        //este es para ver los logs con la hora de ejecucion
        console.log(`${moment().format('YYYYMMDD HH:mm:ss.SSSSSS')} ${message}`)
    }
}

module.exports = Log