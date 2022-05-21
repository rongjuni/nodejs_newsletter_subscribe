const { createServer } = require("http");
const { appendFile } = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const NewsLetter = new EventEmitter();

const server = createServer((req, res) => {
  const chunks = [];
  const { url, method } = req;

  req.on("error", (err) => {
    console.log(err);
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Invalid request" }));
    res.end();
  });

  req.on("error", (err) => {
    console.log(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ msg: "Server error" }));
    res.end();
  });

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (url === "/newsletter_signup" && method === "POST") {
      const body = JSON.parse(Buffer.concat(chunks).toString());

      const newContact = `${body.name},${body.email}\n`;

      NewsLetter.emit("signup", newContact, res);

      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ msg: "Successfully signed to newsletter" }));
      res.end();
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify({ msg: "Not a valid endpoint" }));
      res.end();
    }
  });
});

server.listen(3000, () => console.log("Server Listening..."));

NewsLetter.on("signup", (newContact, res) => {
  appendFile(
    path.join(__dirname, "../assets/newsletters.csv"),
    newContact,
    (err) => {
      // appendFile(path.join(__dirname, "/newsletters.csv"), newContact, (err) => {
      if (err) {
        NewsLetter.emit("error", err, res);
        return;
      }
      console.log("The File was updated successfuly!");
    }
  );
});

NewsLetter.on("error", (err, res) => {
  console.log(err);
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify({ msg: "Error adding new contact to newsletter" }));
  res.end();
});
