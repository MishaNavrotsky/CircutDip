const database = require("./db/db").db;
const session = require("./session/session").session;
const view = require("./view/view").view;

async function main() {
    var connectionString = "mongodb://localhost:27017";
    var db = new database();
    await db.connect(connectionString);
    await db.createSchemeCollection();
    await db.createUserCollection();
    var ses = new session(db);
    var vw = new view(db,ses); 
    vw.sessionInitialize();
    vw.createView();
    vw.listen(80);
}

main();