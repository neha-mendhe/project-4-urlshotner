const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://Project4url:hwGMKlK95Sw2AVNY@cluster0.ukitd.mongodb.net/group88Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected.."))
.catch ( err => console.log(err))


app.use('/', route)


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});