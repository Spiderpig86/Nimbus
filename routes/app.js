let express = require('express')
let app = express()
let path = require('path')
const port = process.env.port || 3000

// Set up static file paths
app.use(express.static(path.join(__dirname, '../public/')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/', 'index.html'))
})

app.listen(port, () => {
    console.log('Nimbus is listening on port ' + port)
})