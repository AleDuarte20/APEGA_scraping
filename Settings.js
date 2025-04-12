class Setting {
    constructor(){
          this.settings = [
            'mongoDbName',
            'mongoUri',
            'proxy',
            'max_number_pagination',
            'debug',
          ]
      }
      
      static build(){
        const Settings = new Setting()
        const configs = process.env
        let settings = Object.entries(configs).filter(config=>Settings.settings.indexOf(config[0]) != -1)
        .reduce((config, value)=>{ 
            const key = value[0]; 
            const val = value[1] === 'true' || value[1]; 
            config[key] = val
            return config
        }, {})
        
        //default values
        settings.debug ? null : settings.debug = true
        settings.proxy ? null : settings.proxy = ""
  
        settings.mongoDbName ? null : settings.mongoDbName = 'Apega'
        settings.mongoUri ? null : settings.mongoUri = `localhost:27017','Apega`
        
        settings.max_number_pagination ? null : settings.max_number_pagination = '100'
        
        //casting
        // settings["wait_timeout"] = parseInt(settings["wait_timeout"])
        settings["debug"] && settings["debug"] === "true" ? settings["debug"] = true : null
        // settings.proxy && typeof settings.proxy === 'string' ? settings.proxy = JSON.parse(settings.proxy) : null
        
        return settings
      } 
  }
  module.exports = Setting
  