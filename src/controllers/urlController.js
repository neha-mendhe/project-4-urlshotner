const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")

const createUrl = async (req, res) => {
    try{

        const baseUrl = 'http:localhost:3000'
        let longUrl = req.body;

    // check base url if valid using the validUrl.isUri method
       if (!validUrl.isUri(baseUrl)) {
         return res.status(401).send('Invalid base URL')
      }

      // if valid, we create the url code
       const urlCode = shortid.generate()

       if (validUrl.isUri(longUrl)) {

        let url = await urlModel.findOne({longUrl})

        // url exist and return the respose
        if (url) {
            res.send(url)
        } else {
            // join the generated short code the the base url
            const shortUrl = baseUrl + '/' + urlCode
            let Url = await urlModel.create(url)
            res.status(200).send({status: true, data: Url})
            
       }
    }else{
        res.status(401).send('Invalid longUrl')
    }

    }catch(err){
        return res.status(500).send({status: false, Error: err.message})
    }
}

module.exports = {createUrl}