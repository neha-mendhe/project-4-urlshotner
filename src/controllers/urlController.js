const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")

const createUrl = async (req, res) => {
    try{

        const longUrl = req.body.longUrl;
        const baseUrl = 'http:localhost:3000'
        if(!validUrl.isUri(baseUrl)){
            return res.status(401).json("Invalid baseUrl");
        }
    
        const urlCode = shortid.generate();
    
        if(validUrl.isUri(longUrl)){
    
                let url = await urlModel.findOne({longUrl : longUrl});
                if(url){
                    return res.status(200).send(url);
                }else{
    
                    const shortUrl = baseUrl + "/" + urlCode;
                    url  = await urlModel.create({longUrl, shortUrl, urlCode});
                    return res.status(201).send(url);
                }
        }else{
            res.status(400).send("Invalid longUrl");
        }    

    }catch(err){
        return res.status(500).send({status: false, Error: err.message})
    }
}

module.exports = {createUrl}