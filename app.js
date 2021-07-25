//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));



//********************MONGOOSE WORK*****************************
mongoose.connect("mongodb+srv://admin-subham:Leomessi10@cluster0.v4fzd.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true});

//creating moongoose Schema
const itemSchema=new mongoose.Schema({
  name: String,
});
//crreating mongoose model
const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name: "Welcome to your Todo list"
});
const item2=new Item({
  name: "Hit the + button to add a different item."
});

const item3=new Item({
  name: "<-- Hit the checkbox to delete an Item"
});


const defaultItems=[item1,item2,item3];

//new custom list Schema
const listSchema={
  name: String,
  items: [itemSchema]
};

const List=mongoose.model("List", listSchema);

//insert many m array pass karte hai isly defaultitems ka array banaye


//
// Item.insertMany(defaultItems,function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else{
//     console.log("Success");
//   }
// })












//***********************************************************************










app.get("/", function(req, res) {
//how to read from our database,{} isly hai kyuki wo condition dene k liye hota hai..empty{} means give me all data
 Item.find({},function(err,foundItems)
{
   if(foundItems.length===0)
   {

     Item.insertMany(defaultItems,function(err){
       if(err)
       {
         console.log(err);
       }
       else{
         console.log("Success");
       }
     });
     //if statement bad render hai hi nai.isly check kiye ki defaultitem empty h?
      //agr haa tuo defualt 3 item add kiye aur redirect kr diye home m taki phr se aaye and checkkare if stamnt,
      //now if fail hoga kyuki 3 item add kiye...else m gaya aur render hoga
     res.redirect("/");
   }
   else{
     res.render("list", {listTitle: "Today", newListItems: foundItems});
   }




});



});


app.get("/:customListName", function(req,res){
  const customListName =_.capitalize(req.params.customListName);
 //dkhre ki dynmaic route jo bana rahe wo already exists karra ki nai
  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      //dkhre kch mila ki nahi already
      if(!foundList){
        const list=new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
         res.render("list",{listTitle:foundList.name ,newListItems:foundList.items});
      }
    }
  })


});














app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
 //yeh itemName user input krra..ab isko tmko model(DBase wala) m badalna hai,,
  const item=new Item({
    name: itemName
  });

 if(listName==='Today')
 {
   item.save();
   res.redirect("/");
 }
else{
  List.findOne({name: listName}, function(err,foundList){


    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);

  })


}

  //now save this in our collection of items

//item ko dikhane k liye jo dale abhi redirect to home "/"


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName= req.body.listName;

if(listName==='Today')
{
  //check google about this method findbyid
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Succesfully Deleted item");
          res.redirect("/");
      }
      });
    }
    else{

      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
        if(!err)
        {
          res.redirect("/" +listName);
        }
      });




      }
      //delete krne bad home m bhejna jaruri wrna ,,,,i got it:)


    });







//check google about this method findbyid
  // Item.findByIdAndRemove(checkedItemId, function(err){
  //   if(!err){
  //     console.log("Succesfully Deleted item");
  //   }
  //   else{
  //     console.log(err);
  //   }
  //   //delete krne bad home m bhejna jaruri wrna ,,,,i got it:)
  //
  //   res.redirect("/");
  // })
  //















// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}




app.listen(port, function() {
  console.log("Server started Succesfully");
});
