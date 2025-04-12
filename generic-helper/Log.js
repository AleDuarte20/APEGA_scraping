const moment = require('moment')
const path = require('path')
// process.env.uuid = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)

class Log {
    constructor(){
        this.log4js = require('log4js')
        this.id = null
    }
    refreshId(functionId) {
      this.id = functionId
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

      info(firstArgument, ...otherArguments) {
        // console.log(`${moment().format('YYYYMMDD HH:mm:ss.SSSSSS')} ${process.env.uuid} ${this.id ? this.id : '     '} ${message}`)
        // this.logs.info(`${process.env.uuid} ${message}`)
        
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const relativeFileName = path.relative(process.cwd(), callee.getFileName());
        const prefix = `${relativeFileName}:${callee.getLineNumber()}:`.split('/').slice(-1);
        if (typeof firstArgument === 'string') {
            // console.log(prefix + ' ' + firstArgument, ...otherArguments);
            console.log(`${moment().format('YYYYMMDD HH:mm:ss.SSSSSS')} ${process.env.uuid} ${prefix} ${this.id ? this.id : '     '} ${firstArgument}`, ...otherArguments)
            this.logs.info(`${process.env.uuid} ${prefix} ${this.id ? this.id : '     '} ${firstArgument}`, ...otherArguments)
        } else {
            // console.log(prefix, firstArgument, ...otherArguments);
            console.log(`${moment().format('YYYYMMDD HH:mm:ss.SSSSSS')} ${process.env.uuid} ${prefix} ${this.id ? this.id : '     '}`, firstArgument, ...otherArguments)
            // this.logs.info(`${process.env.uuid} ${prefix}`, firstArgument, ...otherArguments)
        }
    
      }
}

module.exports = Log