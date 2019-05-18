var database = require("./db/db").db;
var express = require("express");
var crypto = require('crypto');
var fs = require('fs');

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len).toUpperCase(); // return required number of characters
}

async function main() {
    var connectionString = "mongodb://localhost:27017";
    var db = new database();
    await db.connect("mongodb://localhost:27017");
    await db.createCollection();
    var app = express();
    app.get('/', async function (req, res) {
        res.sendFile("index.html", {
            root: "../site"
        });
    });

    app.get('/css/*', function (req, res) {
        res.sendFile(req.path, {
            root: "../site"
        });
    });

    app.get('/draw2d/*', function (req, res) {
        res.sendFile(req.path, {
            root: "../site"
        });
    });

    app.get('/script/*', function (req, res) {
        res.sendFile(req.path, {
            root: "../site"
        });
    })

    app.get("/scheme/*", async function (req, res) {
        var url = req.path.slice(req.path.lastIndexOf("/"));
        var data = await db.find(url);
        res.send(data ? data : "error");
    })

    app.get("/url", function (req, res) {
        res.send(randomValueHex(8));
    })

    app.get("*", function (req, res) {
        res.sendFile("index.html", {
            root: "../site"
        });
    })

    app.post("*", function (req, res) {
        var str = "";
        req.on("data", function (data, err) {
            str += data.toString();
        })
        req.on("end", async function () {
            await db.update(req.path,str);
            res.end();
        })
    })


    app.listen(80);


}

main();