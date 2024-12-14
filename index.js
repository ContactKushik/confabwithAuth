// ⚠️⚠️12:53 14/12/24 SUBAH KA VERSION SKIP+REFRESH WORKS FINE⚠️⚠️ 
const express = require("express");
const cors = require("cors"); // Import cors
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const passport = require("passport");
 // Start of Selection
const configurePassport = require("./configs/passport.js");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
configurePassport(passport);
app.use(passport.initialize());
require("./configs/passport.js");
 // Start of Selection
const db = require("./configs/mongooseConnection.js");

db();

 // Start of Selection
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { 
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
       process.env.CORS_URL, // Use CORS_URL from .env
    ], // Allow requests from localhost:5173, ngrok URL, and your public URL
    methods: ["GET", "POST"],
  },
});

app.set("view engine", "ejs");
app.use(cors()); // Use cors middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/admin',adminRoutes)
// authorization will be handled elsewhere in authRoutes
app.use("/auth", authRoutes);
app.get('/',function (req, res) {
  res.render('index');
})


// app.get("/", (req, res) => {
//   res.render("index");
// });

let waitingusers = [];
let rooms = {}; // Store rooms as an object

io.on("connection", (socket) => {
  console.log(`\n User connected: ${socket.id}`);
  console.log(`Total users connected: ${io.engine.clientsCount}.`);
  console.log(`Total rooms: ${Object.keys(rooms).length}`);
  
  // Notify all users of the total number of online users
  io.emit("totalUsers", io.engine.clientsCount);

  // Handle user joining a room
  socket.on("joinroom", () => {
    if (waitingusers.length > 0) {
      let partner = waitingusers.shift(); // Get the first waiting user
      const roomname = `${socket.id}-${partner.id}`;

      // Create a room as an object
      rooms[roomname] = {
        users: [socket.id, partner.id],
      };

      // Join both users to the room
      socket.join(roomname);
      partner.join(roomname);

      // Notify users of the room
      io.to(roomname).emit("joined", roomname);
      console.log(
        `Room created: ${roomname}. Total rooms: ${Object.keys(rooms).length}`
      );
      console.log(`Total users connected: ${io.engine.clientsCount}.`);
      console.log(`Total rooms: ${Object.keys(rooms).length}`);
       // Log total rooms after creation
    } else {
      waitingusers.push(socket);
    }
  });

  
  socket.on("skipped", (room) =>{
    // Find the room object
    console.log(room);
    console.log("Skipped triggered");
    io.to(room).emit("leave");
    delete rooms[room]; // Remove the room from rooms
    
    console.log(`Total users connected: ${io.engine.clientsCount}.`);
    console.log(`Total rooms: ${Object.keys(rooms).length}`);
  })
  
  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log('user disconnected');
    // Remove from waitingusers if applicable
    let waitingIndex = waitingusers.findIndex(
      (waitingUser) => waitingUser.id === socket.id
    );
    if (waitingIndex !== -1) {
      waitingusers.splice(waitingIndex, 1);
      console.log("yeh part chl rha");
      console.log(`User ${socket.id} removed from waiting list`);
      //  console.log("Total connected clients:", io.engine.clientsCount);
       setTimeout(() => {
         console.log(
           "Total connected clients after delay:",
           io.engine.clientsCount
         );
       }, 100);
      return; // Stop if the user was only in the waiting list
    }

    // Find the room the user was part of
    let roomName = Object.keys(rooms).find((room) => rooms[room].users.includes(socket.id));
    if (roomName) {
      
      const room = rooms[roomName];
      const remainingUserID = room.users.find((id) => id !== socket.id);

      // Remove the room
      delete rooms[roomName];

      // Handle the remaining user
      const remainingUserSocket = io.sockets.sockets.get(remainingUserID);
      if (remainingUserSocket && remainingUserSocket.connected) {
        if (waitingusers.length > 0) {
          let newPartner = waitingusers.shift();
          const newRoomname = `${remainingUserID}-${newPartner.id}`;

          // Create a new room
          rooms[newRoomname] = {
            users: [remainingUserID, newPartner.id],
          };

          // Join both users to the new room
          remainingUserSocket.join(newRoomname);
          newPartner.join(newRoomname);

          // Notify users of the new room
          io.to(newRoomname).emit("joined", newRoomname);
          console.log(
            `New room created: ${newRoomname}. Total rooms: ${Object.keys(rooms).length} \n`
          ); // Log total rooms after creation
        } else {
          // Add remaining user to the waiting list
          waitingusers.push(remainingUserSocket);
          console.log(`User ${remainingUserID} added to waiting list \n`);
          
          // console.log(`Total rooms: ${Object.keys(rooms).length}`);
        }
        
      }
    }

    console.log(`User disconnected: ${socket.id} \n`);
    setTimeout(() => {
      console.log(
        `Total users connected: ${io.engine.clientsCount}. Total rooms: ${
          Object.keys(rooms).length
        } \n`
      );
    }, 100); // 100ms delay
    // Notify all users of the total number of online users after a disconnect
    setTimeout(() => {
        io.emit("totalUsers", io.engine.clientsCount);
    }, 100); // 100ms delay
  });

  socket.on("signalingMessage", function (data) {
    socket.broadcast.to(data.room).emit("signalingMessage", data.message);
  });
});

// Render the homepage
app.get("/", function (req, res) {
  res.render('index');
});


// Start the server
server.listen(process.env.PORT||3000, () => {
  console.log("Server is running on port 3000: http://localhost:3000");
});
