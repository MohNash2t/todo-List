const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const PORT = process.env.PORT || 3000;
let items = ["buy food", "make food", "eat food"];
let workItems = [];

const app = express();

app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	let day = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
	res.render("list", { listTitle: day, newListItem: items });
});

app.post("/", (req, res) => {
	let item = req.body.newItem;
	if (req.body.list === "work List") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	}
});

app.get("/work", (req, res) => {
	res.render("list", { listTitle: "work List", newListItem: workItems });
});

app.listen(PORT, () => {
	console.log("this server is listing to port 3000");
});
