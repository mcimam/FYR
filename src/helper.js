// Bunch of usefull function
const JsonRecords = require('json-records');
const ObjectsToCsv = require('objects-to-csv-file');

// delay function
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Custom Value register to with unsual behaviour
class ValueRegistry {
    constructor(value = {}) {
        this.value = (typeof value === 'object') ? value : {}
        this.activeKey = ''

        // Set PK
        this.value['_id'] = Math.random().toString(16).slice(2)
    }

    getValue(key){
        return this.value[key] || null;
    }

    // Register key and keep it active till value/ new key is set
    registerKey(key, upsert = false) {
        this.activeKey = ''
        // Don't replace new key if not upsert
        if (!upsert && (key in this.value)) {
            return;
        }
        this.activeKey = key

    }

    registerValue(value) {
        if(this.activeKey) { 
            this.value[this.activeKey] = this.convertValue(value) 
        }
        this.activeKey = null
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
        this.saveLocation = process.env.SAVELOC || '/home/mcimam/PersonalProject/Fyr/result'
        this.filename = name
        this.jr = new JsonRecords(`${this.saveLocation}/${this.filename}.json`)
    }

    append(value){
        if(typeof value !== 'object') { throw new Error('Value must be ValueRegistry Instance')}
        this.value.push(value)
    }

    getValue() {
        let arr = []
        for (const val of this.value) {
            arr.push(val.value)
        }
        return arr
    }
    resetJson() {
        this.jr.remove()
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