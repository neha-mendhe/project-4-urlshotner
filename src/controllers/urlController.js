const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")
const redis = require("redis");
const { promisify } = require("util");

//Creating a redis client
const redisClient = redis.createClient(
    11556,
    "redis-11556.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );

  //Authenticating the client (our application)
  redisClient.auth("LpmEMM37UfAoqaVYOSMlL4H0qAnhYp04", function (err) {
    if (err) throw err;
  });
  
  //if connect console log a message
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  
  //using promisify and bind creating functions
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
  
  //POST /url/shorten
  const createUrl = async (req, res) => {
    try{

        const data = req.body;

        //valid data
        if(Object.keys(data).length == 0) return res.status(400).send({status: false, message: "Invalid URL Please Enter valid details"}) 

        //check longurl is present or not
        if(!data.longUrl) return res.status(400).send({status: false, message: "longUrl is required"})

        //checking for a valid url data in request body
        if(validUrl.isUri(data.longUrl)){
    
                //getting the data from cache if present
                let getUrl = await GET_ASYNC(`${data.longUrl}`)

                //converting from string to JSON
                let url = JSON.parse(getUrl)
                if(url){
                    return res.status(200).send({status: true, message: "Success",data: url});
                }else{
    
                    //take baseurl
                    const baseUrl = 'http:localhost:3000'
                    //generating the urlcode
                    let urlCode = shortid.generate().toLowerCase();
                    
                    //creating a shorturl
                    let shortUrl = baseUrl + "/" + urlCode;

                    data.urlCode = urlCode
                    data.shortUrl = shortUrl

                    //creating a document
                    url = await urlModel.create(data)
                    let responseData  = await urlModel.findOne({urlCode:urlCode}).select({_id:0, __v:0,createdAt: 0, updatedAt: 0 });

                    //finding the same created document and then setting the document in the cache
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
     //getting the data from cache if present
    let cacheData = await GET_ASYNC(`${req.params.urlCode}`)

    //converting from string to JSON
    let url = JSON.parse(cacheData)
    if(url){
         return res.status(302).redirect(url.longUrl) // redirecting to original url
    }else{
        let code = await urlModel.findOne({urlCode: req.params.urlCode}) 
        if(!code) return res.status(400).send({status: false, message:"Url-code not Found"})

        //if already exisst then setting the document in the cache
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(code))

        //redirecting to the original url
        return res.status(302).redirect(code.longUrl);
    }
  }catch(err){
         return res.status(500).send({status: false, Error: err.message})
     }
    }
    
module.exports = {createUrl, getUrl}

