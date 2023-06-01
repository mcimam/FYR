// Bunch of usefull function
const JsonRecords = require('json-records');
const ObjectsToCsv = require('objects-to-csv-file');

// delay function
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Custom Value register to with unsual behaviour
class ValueRegistry {
    constructor(value = {}) {
        this.value = (typeof value === 'object') ? value : {}
        this._activeKey = ''

        // Set PK
        if(this.value['_id'] != undefined){
            this.value['_id'] = Math.random().toString(16).slice(2)
            this.id = this.value['_id']     
        }
    }

    getValue(key){
        return this.value[key] || null;
    }

    // Register key and keep it active till value/ new key is set
    registerKey(key, upsert = false) {
        this._activeKey = ''
        // Don't replace new key if not upsert
        if (!upsert && (key in this.value)) {
            return;
        }
        this._activeKey = key

    }

    registerValue(value) {
        if(this._activeKey) { 
            this.value[this._activeKey] = this.convertValue(value) 
        }
        this._activeKey = null
    }
   
    
    addValue(key, value, upsert=false) {
        if (!upsert && (key in this.value)) {
            return;
        }

        this.value[key] = value
    }

    isValidValue(value) {
        if (typeof value != "string") return false

        // Valid value are:
        //  - 00,01,13 int
        //  - 11.23% percentage
        //  - -- dash
        
        if (value === '--') return true
        if (parseInt(value) != isNaN) return true
        
        return false
    }

    isEmpty(){
        if(this.value == {}){
            return true
        }

        return false
    }

    convertValue(value) {
        if (value === '--') return 0
        if (parseInt(value) != isNaN) return parseInt(value)        
    }

}

class SetRegistry {
   

    constructor(name){
        this.value = []
        this.rawValue = []
        this.saveLocation = process.env.SAVELOC
        this.filename = name
        this.path = ''
        this.loadJson()
    }

    append(value){
        if(typeof value !== 'object') { throw new Error('Value must be ValueRegistry Instance')}
        this.value.push(value)
        this.rawValue.push(value.value)
    }

    getValue() {
        let arr = []
        for (const val of this.value) {
            arr.push(val.value)
        }
        this.rawValue = arr
        return arr
    }
    resetJson() {
        this.jr.remove()
    }

    loadJson(){
        // This is for loading json file
        let path = ''
        if(this.saveLocation != undefined){
            path = this.saveLocation
        }
        if(this.filename != '' && this.filename != undefined){
            if(path != ''){
                path += '/'
            }
            if(this.filename[0] != '/'){
                path += '.'
            }
            path += `${this.filename}.json`
        }

        this.path = path
        this.jr = new JsonRecords(path)

        // Load JR to ValueRegistry
        const allRecords = this.jr.get()
        for(const record of allRecords) {
            const val = new ValueRegistry(record)
            this.value.push(val)
        }
    }

    saveJson(){
        const allRecords = this.getValue()
        if(allRecords.length == 0 ){
            console.error("No Record Found")
            return;
        }

        this.jr.addBulk(allRecords)
    }

    getJson(){
        const records = this.jr.get()
        for(const record of records){
            const record_register = new ValueRegistry(record)
            this.value.push(record_register)
        }
        return this.value
    }

    async saveCSV(){
        const allRecords = this.getValue()
        if(allRecords.length == 0 ){
            console.error("No Record Found")
            return;
        }
        await new ObjectsToCsv(allRecords).toDisk(`${this.saveLocation}/${this.filename}.csv`, {allColumns:true, append:false})
    }

    isEmpty() {
        if(this.value.length <= 0){
            return true
        }
        return false
    }

    
}



module.exports = {
    delay,
    ValueRegistry,
    SetRegistry,

}