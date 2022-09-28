const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const bookController = require('../controller/bookController')
const reviewController = require("../controller/reviewController")
const auth = require("../middlewares/auth")
const aws= require("aws-sdk")




// dummy 
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})


// ------------ Creating user ------------------------------------------------------
router.post("/register",userController.registerUser )

// ------------ login for user -----------------------------------------------------
router.post("/login", userController.userLogin)

// ----------- creating book --------------------------------------------------------
router.post("/books", auth.authenticate, bookController.createBook)

// ------------ get book by query filters -------------------------------------------
router.get("/books",auth.authenticate, bookController.getAllBooks)

// ------------ get books by BookId --------------------------------------------------
router.get("/books/:bookId",auth.authenticate, bookController.bookById)

// ------------ update book by BookId -------------------------------------------------
router.put("/books/:bookId",auth.authenticate, auth.authorise, bookController.updateBook)

// ------------- delete by BookId -----------------------------------------------------
router.delete("/books/:bookId",auth.authenticate, auth.authorise, bookController.deleteBookById)

// ------------ creating review --------------------------------------------------------
router.post("/books/:bookId/review",reviewController.createReview )

// ------------ updating review --------------------------------------------------------
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)

// ------------ delelte review by reviewId and bookId -----------------------------------
router.delete("/books/:bookId/review/:reviewId", reviewController.reviewDeleteById)


//====================================aws3===============================================================================

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err.message})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})

module.exports = router