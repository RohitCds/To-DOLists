//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://rohitshroff:test123@cluster0.n1tohr8.mongodb.net/todolistDB");
const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "hello"
});

const item2 = new Item ({
  name: "howdy"
});

const item3 = new Item ({
  name: "heyy"
});

const myitems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


const workItems = [];

app.get("/", function(req, res) {
  Item.find({/* search query*/ }).then(foundItems => {
    if (foundItems.length===0) {
      Item.insertMany(myitems).then(function(){
        console.log("Items inserted")  // Success
      }).catch(function(error){
        console.log(error)      // Failure
      });
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});   //you dont really HAVE to call it foundItems, its simply an object containing whatever data you founf using .find() method.
    }
  })
  .catch(err => {
    console.error(err)
  })
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName }).then((foundList)=>{
    if(!foundList)
    {
      const list = new List ({
        name: customListName,
        items: myitems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch((err)=>{
     console.log(err);
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundIt)=>{
    foundIt.items.push(item);
    foundIt.save();
    res.redirect("/" + listName);
    })
    .catch((err)=>{
    console.log("err");
    });
  }
});

app.post("/delete", function(req, res){
  const listName = req.body.listName;
  const checkeditemID = req.body.checkbox;
  if(listName=="Today"){
    Item.findByIdAndRemove(checkeditemID).then(function(){
      console.log("item deleted"); // Success
    }).catch(function(error){
      console.log(error); // Failure
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkeditemID}}}).then((foundList)=>{
      res.redirect("/"+listName);
    })
    .catch((err)=>{
      console.log(err);
    });
  }  
}) 

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
