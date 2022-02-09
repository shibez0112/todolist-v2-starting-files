//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewURLParser: true});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Do Homework"
});

const item2 = new Item({
  name: "Do Chores"
});

const item3 = new Item({
  name: "Learn new English vocabulary"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if(err){
      console.log(err)
    }
    else{
      if (result.length === 0){
        Item.insertMany(defaultItems,function(err){
          if(err)
          {
            console.log("Cannot import data");
          }
          else
          {
            console.log("Sucessfully import data");
          }
        });
        res.redirect("/")
      }
      else{
      res.render("list", {listTitle: "Today", newListItems: result});
      }
    }
  })

});

app.post("/delete", function(req,res){
  deleteID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(deleteID, function(err){
      if (err){
        console.log(err)
      }
      else{
        console.log("Sucessfully delete Item")
      }
    })
    res.redirect("/")
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: deleteID}}}, function(err, result){
      if (err){
        console.log(err)
      }
      else{
          console.log("Sucessfully delete Item")
        res.redirect("/"+listName)
      }
    })
  }
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, result){
      if (err){
        console.log(err)
      }
      else{
        result.items.push(item);
        result.save();
        res.redirect("/" + listName)
      }
    })
  }
});


app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)

  List.findOne({'name': customListName}, function(err, results){
    if (err){
      console.log(err)
    }
    else if (results)
    {
      console.log("Found existing list")
      res.render("list", {listTitle: results.name, newListItems: results.items});
    }
    else{
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      console.log("Sucessfully save list")
      list.save()
      res.redirect("/"+ customListName)
    }
  });

})


app.get("/about", function(req, res){
  res.render("about");
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

