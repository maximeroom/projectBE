var repo = require("./models/usersRepo");

module.exports=(function(configURL, database){
    
    var db=database.connect(configURL);
    
    database.connection.on("open",function(){
        var msg = "connection met mongo server " + configURL;
        
        var collections = database.connection.collections;
        msg += "\n \t with known collections/models: ";
        for (var property in collections) {
            msg += collections[property].name + ", ";
        }
        console.log(msg);
    });
    
    database.connection.on("error",function(error){
        console.log("connection error met MongoDB: "+ error.message);
    });
    
    database.connection.on("close", function () {
        console.log("connection closed: ", configURL);
    });

    return database;
    
});
