let express = require('express')
let app = express()
let path = require('path')
const port = process.env.PORT || 8000

// must specify options hash even if no options provided!
let phpExpress = require('php-express')({
 
  // assumes php is in your PATH
  binPath: 'php'
});

// Set up static file paths
app.use(express.static(path.join(__dirname, '../public/')));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/fonts', express.static(path.join(__dirname, '../public/fonts')));
app.use('/php', express.static(path.join(__dirname, '../public/php')));
 
// set view engine to php-express
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
 
// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);



app.get('/', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.sendFile(path.join(__dirname, '../public/', 'index.html'))
    
})

app.listen(port, () => {
    console.log('Nimbus is listening on port ' + port)
})