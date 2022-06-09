//require libraries
const express = require("express");
const path = require("path");
const fs = require("fs");
const {
    JSDOM
} = require("jsdom");

//set app and port
const app = express();
const port = process.env.PORT || "3000";

// IMPORTANT - tell to parse form data 
app.use(express.urlencoded({ extended: true }));

//set paths and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));


//read xml file to dom tree
var libraries;
fs.readFile("./data/library-data.kml", "utf-8", (err, data) => {
    const dom = new JSDOM(data, {
        contentType: "application/xml"
    }); //load XML file content
    libraries = dom.window.document; //load XML DOM tree
});

function listAllLibraries() {
    return libraries.querySelectorAll("Placemark");
}

function getLibraryById(lid) {
    let libraryNode = libraries.evaluate(`//Placemark[@id='${lid}']`, libraries, "http://www.opengis.net/kml/2.2", 4, null).iterateNext();
    return libraryNode;
}

//set routes
app.get("/", (req, res) => {
    let libraryList = listAllLibraries();
    res.render("index", {
        title: "Home",
        libraries: libraryList
    });
});

app.get("/library", (req, res) => {
    //fetch id
    let lId = req.query.libraryBranch;
    console.log(lId);
    //fetch library info
    let libraryInfo = getLibraryById(lId);
    let libraryName = libraryInfo.querySelector("name").textContent;
    res.render("library", {
        title: libraryName,
        library: libraryInfo
    });
})



//server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})