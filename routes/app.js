let express = require('express')
let app = express()
let path = require('path')
const port = process.env.port || 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/', 'index.html'))
})

app.listen(port, () => {
    console.log('Nimbus is listening on port ' + port)
})