//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash"); //_(underscore) is also called 'lodash'
const https = require("https");

require("dotenv").config();

const apikey = process.env.My_BLOG_API_KEY;

const posts = []; //Array consisting of all the posts

const app = express();

const homeStartingContent =
  "Welcome to Our Blog World. Dive into the world of captivating stories, insightful articles, and endless inspiration. Our blog is your passport to a realm of knowledge and creativity. Explore, learn, and be inspired every day. Here, you can share your daily musings, your dreams, your triumphs, and even your challenges. It's a safe space for self-expression and reflection. Your life is a masterpiece, and every day is a brushstroke. Capture it here, and let this blog be the canvas where your authenticity shines. Ready to start your daily diary? Begin your journey here.";
const aboutContent =
  "Hello! I'm Debanjan, an enthusiastic engineering student with a deep-rooted passion for crafting and shaping the digital world. I believe that the internet is a playground for innovation and creativity, and I'm here to make my mark.";

const contactContent =
  "Have a question, a project in mind, or just want to chat? I'd love to hear from you! Feel free to reach out by filling the form below.";

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home", {
    homeContent: homeStartingContent,
    postsArray: posts,
  });
});

app.get("/posts/:post", (req, res) => {
  const inputPath = req.params.post;
  const inputPathInKebabCase = _.kebabCase(inputPath); //using lodash to convert a string to kebab-case
  posts.forEach((post) => {
    const postTitleInKebabCase = _.kebabCase(post.postTitle); //using lodash to convert a string to kebab-case

    if (inputPathInKebabCase === postTitleInKebabCase) {
      //checking if any one post has same title as the route enterered by user
      res.render("post", {
        postTitle: post.postTitle,
        postBody: post.postBody,
      });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about", { aboutPageContent: aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact", { contactPageContent: contactContent });
});

app.get("/compose", (req, res) => {
  res.render("compose");
});

app.post("/compose", (req, res) => {
  const formData = {
    postTitle: req.body.composeTitle,
    postBody: req.body.composeBody,
  };

  posts.push(formData);

  res.redirect("/");
});

app.post("/", (req, res) => {
  const mail = req.body.userEmail;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  const data = {
    members: [
      {
        email_address: mail,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  var jsonData = JSON.stringify(data);

  const url = "https://us12.api.mailchimp.com/3.0/lists/0e76f5fe84";
  // const url = "https://us12.api.mailchimp.com/3.0/lists/0e76f5fe8";

  const auth_value = "debanjan1:" + apikey;
  const options = {
    method: "POST",
    auth: auth_value,
  };

  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.render("reachingOut");
    } else {
      res.render("error");
    }

    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData); //Sending our data to mailchimp's server
  request.end();
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
