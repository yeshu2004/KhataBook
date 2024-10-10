const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// Function to generate a unique filename
function getUniqueFilename(basePath, callback) {
    let count = 0;
    let newFilename = `${basePath}.txt`;

    function checkFilename() {
        const filenameToCheck = count === 0 ? newFilename : `${basePath}(${count}).txt`;
        fs.stat(filenameToCheck, (err) => {
            if (!err) {
                count++;
                checkFilename();
            } else {
                callback(filenameToCheck);
            }
        });
    }

    checkFilename();
}

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    fs.readdir("./files", (err, files) => {
        if (err) return res.status(500).send(err);
        res.render("index", { files });
    });
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.post("/createhisaab", (req, res) => {
    const currentDate = new Date();
    const date = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const basePath = `./files/${date}`

    getUniqueFilename(basePath, (uniqueFilename) => {
        const fileContent = `${req.body.details}`
        fs.writeFile(uniqueFilename, fileContent, (err) => {
            if (err) return res.status(500).send(err);
            res.redirect("/");
        });
    });
});

app.get("/hisaab/:filename",(req,res)=>{
    fs.readFile(`./files/${req.params.filename}`, function(err,data){
        res.render("view",{filename: req.params.filename, data})
        console.log(err);
    })
})

app.get("/edit/:filename",(req,res)=>{
    fs.readFile(`./files/${req.params.filename}`, function(err,data){
        res.render("edit",{filename: req.params.filename, data})
        console.log(err);
    })
})

app.post(`/update/:filename`,(req,res)=>{
    fs.writeFile(`./files/${req.params.filename}`,`${req.body.editDetails}`, 'utf8',(err)=>{
        if (err) console.log(err)
        res.redirect("/")
    })  
})

app.get("/delete/:filename",(req,res)=>{
    fs.unlink(`./files/${req.params.filename}`,function(err){
        if( err ) console.log(err)
        res.redirect("/")
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
