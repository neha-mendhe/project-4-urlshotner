const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    11556,
    "redis-11556.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("LpmEMM37UfAoqaVYOSMlL4H0qAnhYp04", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  
  
  //1. connect to the server
  //2. use the commands :
  
  //Connection setup for redis
  
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
  
  const createUrl = async (req, res) => {
    try{

        const data = req.body;
        const baseUrl = 'http:localhost:3000'

        
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Invalid URL Please Enter valid details"}) 
        if(!data.longUrl) return res.status(400).send({status: false, message: "longUrl is required"})

        if(validUrl.isUri(data.longUrl)){
    
                let getUrl = await GET_ASYNC(`${data.longUrl}`)
                let url = JSON.parse(getUrl)
                if(url){
                    return res.status(200).send({status: true, message: "Success",data: url});
                }else{
    
                    let urlCode = shortid.generate().toLowerCase();
                    
                    let shortUrl = baseUrl + "/" + urlCode;

                    data.urlCode = urlCode
                    data.shortUrl = shortUrl

                    url = await urlModel.create(data)
                    let responseData  = await urlModel.findOne({urlCode:urlCode}).select({_id:0, __v:0,createdAt: 0, updatedAt: 0 });
                    await SET_ASYNC(`${data.longUrl}`, JSON.stringify(responseData))
                    return res.status(201).send({status: true, message: "URL create successfully",data:responseData});

                }
        }else{
           return res.status(400).send({status: false, message: "Enter a valid Url"});
        }    

    }catch(err){
        return res.status(500).send({status: false, Error: err.message})
    }
}


const getUrl = async (req, res) => {

    try{
    let cacheData = await GET_ASYNC(`${req.params.urlCode}`)
    let url = JSON.parse(cacheData)
    if(url){
         return res.status(307).redirect(url.longUrl)
    }else{
        let code = await urlModel.findOne({urlCode: req.params.urlCode}) 
        if(!code) return res.status(404).send({status: false, message:"Url-code not Found"})

        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(code))
        return res.status(307).redirect(code.longUrl);
    }
  }catch(err){
         return res.status(500).send({status: false, Error: err.message})
     }
    }
    
module.exports = {createUrl, getUrl}



// There is a NPM package called ‘shortid’ used to create short non-sequential url-friendly unique ids.
//  By default, it uses 7-14 url-friendly characters: A-Z, a-z, 0-9, _-.