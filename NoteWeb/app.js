const http = require('http');
var fs=require("fs");  
var url=require("url")
var utils = require("./utils")

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  //res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  
  var path = url.parse(req.url).pathname;
  if(path == "/")
  {
    var data=fs.readFileSync("index.html", "utf-8");  
    res.end(data);
  }
  else
  {
    if(path.indexOf("/video") == 0)
    {
      console.log("video");
      videorequest(req, res, "." + path);
      console.log("video end");
    }
    else
    {
      var data=fs.readFileSync('.' + path);  
      res.end(data);
    }
  }
  
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function videorequest(req, res, path)
{
  var stats = fs.statSync(path);

  console.log("header range");
  console.log(req.headers["range"])

  if(req.headers["range"] == undefined)
  {
    console.log("undefine")
    var stream = fs.createReadStream(path);
    res.writeHead('200', "Partial Content");
    stream.pipe(res);
    return;
  }


  var range = utils.parseRange(req.headers["range"], stats.size);
  console.log(range)
  if (range) {
      res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
      res.setHeader("Content-Length", (range.end - range.start + 1));
      var stream = fs.createReadStream(path, {
          "start": range.start,
          "end": range.end
      });
      res.writeHead('206', "Partial Content");
      stream.pipe(res);
  } else {
      response.removeHeader("Content-Length");
      response.writeHead(416, "Request Range Not Satisfiable");
      response.end();
  }
}