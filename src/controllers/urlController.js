const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")

const createUrl = async (req, res) => {
    try{

        const longUrl = req.body.longUrl;
        const baseUrl = 'http:localhost:3000'
        if(!validUrl.isUri(baseUrl)){
            return res.status(401).send({status: false, message: "Invalid baseUrl"});
        }
    
        let urlCode = shortid.generate();
    
        if(validUrl.isUri(longUrl)){
    
                let url = await urlModel.findOne({longUrl : longUrl}).select({_id: 0, __v: 0});
                // if url exist and return the respose
                if(url){
                    return res.status(200).send({data:url});
                }else{
    
                    // join the generated urlcode to the baseurl
                    let shortUrl = baseUrl + "/" + urlCode;
                    url  = await urlModel.create({longUrl, shortUrl, urlCode});
                    return res.status(201).send({data:url});
                }
        }else{
           return res.status(400).send({status: false, message: "Invalid longUrl"});
        }    

    }catch(err){
        return res.status(500).send({status: false, Error: err.message})
    }
}

module.exports = {createUrl}