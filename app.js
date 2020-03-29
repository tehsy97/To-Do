const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/modules/date.js");
// console.log(__dirname + "/modules");
const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("assets"));

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = new mongoose.Schema({
    name: 
    {
        type: String,
        required: [true, "What you gonna do today?"]
    }
});

const listSchema = new mongoose.Schema({
    name: 
    {
        type: String,
        required: [true, "List title is missing"]
    },
    items: [itemsSchema]
});


// Create collections
const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {
    const currDay = date.getDate();

    // Search and show data in DB
    Item.find({}, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else {
            console.log("At route");
            res.render("list", {listTitle: currDay, newListItems: foundItems});
        }
    });
});

// Insert
app.post("/", function(req, res) {
    const currDay = date.getDate();

    const itemName = req.body.newItem;
    const listName = req.body.list;

    // check if item to be insert is an empty string
    if (itemName != "") {
        // Create item doc
        const item = new Item({
            name: itemName
        });
        
        // check default or custom list 
        if (listName == currDay) {  // item collection    
                // check if item already exists
                Item.exists({name: itemName}, function(err, found){
                    if (err) {
                        console.log(err);
                    } else if (!found) {
                        // Insert item to collection
                        item.save();
                        console.log("Succesfully added in items collection");
                    }
                });
        } else {  // list collection
            List.findOne({name: listName}, function(err, foundList) {
                List.exists({items: item}, function(err, found){
                    if(err){
                        console.log(err);
                    } else if (!found){
                        foundList.items.push(item);
                        foundList.save();  
                        console.log("Succesfully added in list collection");      
                    }
                });
            });
        }
    } 

    // check default or custom list and redirect to the page
    if (listName == currDay) {
        res.redirect("/");
    } else {
        console.log('redirecting to custom list')
        res.redirect("/" + listName);
    }
});

// Delete ToDo list items
app.post("/delete", function(req, res){
    // console.log(req.body);
    
    const currDay = date.getDate();
    const listName = req.body.listName;
    const checkItemId = req.body.checkbox;

    if (listName == currDay) {
        Item.findByIdAndRemove(checkItemId, function(err){
            if (err) {
                console.log(err);
            } else {
                console.log("Succesfully deleted " + checkItemId);
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err){
            if (err) {
                console.log(err);
            } else {
                console.log("Succesfully deleted " + checkItemId);
            }
            res.redirect("/" + listName);
        })
    }
});

app.post("/delete_lists", function(req, res){
    const checkItemId = req.body.checkbox;
    // console.log(checkItemId);
    List.findByIdAndRemove(checkItemId, function(err){
        if (err) {
            console.log(err);
        } else {
            console.log("Succesfully deleted Title id: " + checkItemId);
        }
    });
    
    res.redirect("/showLists");
});


app.get("/showLists", function(req, res){
    // Search and show data in DB
    List.find({}, function(err, foundItems) {
        if (err) {
            console.log(err);
        } else {
            console.log("At showList");
            res.render("showTitles", {listTitle: "To-Do Lists", newListItems: foundItems});
        }
    });
});

app.post("/redirect", function(req, res){
    console.log(req.body.newTitle);
    if(req.body.newTitle != ''){
        res.redirect("/" + req.body.newTitle);
    } else {
        res.redirect("/");
    }
});

app.get('/favicon.ico', function(req, res){
    res.status(204);
});

app.get("/:customListName", function(req,res) {
    // console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName}, function(err, foundList) {
        if (err) {
            console.log(err);
        } else {
            if(!foundList){
                // Create list doc
                const list = new List({
                    name: customListName
                });

                // Insert list title
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

app.listen(port, function(){
    console.log("Server started");
});