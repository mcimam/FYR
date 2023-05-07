// Bunch of usefull function

// delay function
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Custom Value register to with unsual behaviour
class ValueRegistry {
    constructor(value = {}) {
        this.value = (typeof value === 'object') ? value : {}
        this.activeKey = ''
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

    convertValue(value) {
        if (value === '--') return 0
        if (parseInt(value) != isNaN) return parseInt(value)        
    }

}

module.exports = {
    delay,
    ValueRegistry

}