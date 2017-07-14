let express = require('express')
let app = express()
let path = require('path')
let compression = require('compression')

const port = process.env.PORT || 8000

// Gzip
app.use(compression());

// Set up static file paths
app.use(express.static(path.join(__dirname, '../public/')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/fonts', express.static(path.join(__dirname, '../public/fonts')));
app.use('/php', express.static(path.join(__dirname, '../public/php')));

app.get('/', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.sendFile(path.join(__dirname, '../public/', 'index.html'))
    
})

app.listen(port, () => {
    console.log('Nimbus is listening on port ' + port)
})