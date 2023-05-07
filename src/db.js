const { TYPES } =   require('tedious');

const knex = require('knex')({
    client: 'mssql',
    connection: {
        host: '194.233.64.153',
        port: '1433',
        user: 'sa',
        password: '3Llamas!',
        database: 'fey_dev',
        options: {
            mapBinding: value => {
            // bind all strings to varchar instead of nvarchar
            if (typeof value === 'string') {
                return {
                type: TYPES.VarChar,
                value
                };
            }
    
            // allow devs to pass tedious type at query time
            if (value != null && value.type) {
                return {
                type: value.type,
                value: value.value
                };
            }
    
            // undefined is returned; falling back to default mapping function
            }
        }
    }
  });