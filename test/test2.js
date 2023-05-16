const {ValueRegistry} = require('./helper')

const register = new ValueRegistry({})

register.addValue('test', 1)

register.saveJson('test.json')