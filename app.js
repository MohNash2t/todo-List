const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const PORT = process.env.PORT || 3000;
const _ = require("lodash");

const app = express();

// DataBase setup

// DB Connection
mongoose.connect(
	"mongodb+srv://admin-nash2t:test123@cluster0.rfradcl.mongodb.net/todoListDB"
);
// Schema
const itemsSchema = new mongoose.Schema({
	name: String,
});
// Model
const Item = mongoose.model("item", itemsSchema);
//Init documents
const first = new Item({
	name: "Welcome to your todolist!",
});

const second = new Item({
	name: "Hit the + button to add a new item.",
});

const third = new Item({
	name: "<-- Hit this to delete an item.",
});

const defaultItems = [first, second, third];

const listSchema = new mongoose.Schema({
	name: String,
	items: [itemsSchema],
});

const List = mongoose.model("list", listSchema);
// add document to the DB
// Item.insertMany(defaultItems, (err) => {

// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log("document added successfully");
// 	}
// });

app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	// let day = new Date().toLocaleDateString("en-US", {
	// 	weekday: "long",
	// 	month: "long",
	// 	day: "numeric",
	// });
	Item.find({}, (err, result) => {
		if (result.length === 0) {
			Item.insertMany(defaultItems, (err) => {
				if (err) {
					console.log(err);
				} else {
					console.log("Successfully saved the document");
				}
			});
			res.redirect("/");
		} else {
			res.render("list", { listTitle: "Today", newListItem: result });
		}
	});
});

app.post("/", (req, res) => {
	let itemName = req.body.newItem;
	let itemValue = req.body.list;
	const newItem = new Item({
		name: itemName,
	});
	if (itemValue === "Today") {
		newItem.save();
		res.redirect("/");
	} else {
		List.findOne({ name: itemValue }, (err, foundList) => {
			foundList.items.push(newItem);
			foundList.save();
			res.redirect("/" + itemValue);
		});
	}
});

app.post("/delete", (req, res) => {
	const cheakedItemId = req.body.checkbox;
	const listName = req.body.listtitle;
	console.log(listName)
	if (listName === "Today") {
		Item.deleteOne({ _id: cheakedItemId }, (err) => {
			res.redirect("/");
		});
	} else {
		List.findOneAndUpdate(
			{
				name: listName,
			},
			{
				$pull: { items: { _id: cheakedItemId } },
			},
			(err, foundList) => {
				if (!err) {
					res.redirect("/" + listName);
				}
			}
		);
	}
});

app.get("/:pageName", (req, res) => {
	const pageName = _.lowerCase(req.params.pageName);
	console.log(pageName);
	List.findOne({ name: pageName }, (err, results) => {
		if (err) {
			console.log(err);
		} else {
			if (results) {
				console.log("this document exists");
				res.render("list", {
					listTitle: results.name,
					newListItem: results.items,
				});
			} else {
				const list = new List({
					name: pageName,
					items: defaultItems,
				});
				list.save();
				console.log("Save completed");
				res.redirect("/" + pageName);
			}
		}
	});
});

app.listen(PORT, () => {
	console.log("this server is listing to port 3000");
});
