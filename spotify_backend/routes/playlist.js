const express = require("express");
const passport = require("passport");
const Playlist = require("../models/Playlist")
const User = require("../models/User");
const song = require("../models/Song");
const router = express.Router();

// Route 1: Create a Playlist
// /playlist/create
router.post("/create",
passport.authenticate("jwt", {session:false}),
async (req,res) => {
    const currentUser = req.user;
    const {name,thumbnail, songs} = req.body;
    if(!name || !thumbnail || !songs){
        return res.status(301).json({err:"Insufficient data"});
    }
    const playlistData = {
        name,
        thumbnail,
        songs,
        owner:currentUser._id,
        collaborators:[],
    };
    const playlist = await Playlist.create(playlistData);
    return res.status(200).json(playlist);
  }
);


// Route 2: Get a playlist by ID
// we will get the playlist ID as a route parameter and we will return the playlist having that ID
// something1/something2/something3 ----> exact match
// something1/something2/soemthing4 ----> this will not call the api on the previous line
// If we are doing /playlist/get/:playlistId (focus on the :) --> this means that playlistId is now a variable to which we can assign any value
// If you call anything of the format /playlist/get/safaksfkf (sakfajsk can be anything) , this api is called
// If you called /playlist/get/safakssl, the playlistId variable gets assigned the value
router.get("/get/playlist/:playlistId", passport.authenticate("jwt", {session:false}),
async (req,res) => {
    // This is called req.params
    const playlistId = req.params.playlistId;
    // I need to find a playlist with the _id = playlistId
    const playlist = await Playlist.findOne({_id: playlistId});
    if(!playlist) {
        return res.status(301).json({err:"Invalid ID"});
    }
    return res.status(200).json(playlist);

}
);

// Get all playlists made by an artist
// /get/artist/xyz
router.get("/get/artist/:artistId", passport.authenticate("jwt", {session:false}),
async (req,res) => {
    console.log("bh")
    const artistId = req.params.artistId;
    // we can do this: Check if artist with given artist Id exists
    const artist = await User.findOne({_id:artistId});
     if(!artist) {
        return res.status(304).json({err:"Invalid Artist ID"});
     }
    const playlists = await Playlist.find({owner:artistId});
    return res.status(200).json({data:playlists});
});

// Add a song to a playlist
router.post("/add/song",
 passport.authenticate("jwt", {session:false}),
async (req,res) => {
    const currentUser = req.user;

        const {playlistId, songId} = req.body;
        // Step 0: Get the Playlist if valid
        const playlist = await Playlist.findOne({_id: playlistId});
     if(!playlist) {
        return res.status(304).json({err:"Playlist does not exist"});
     }

     console.log(playlist);
     console.log(currentUser);
     console.log(playlist.owner);
     console.log(currentUser._id);
    //  console.log(typeof playlist.owner);
     console.log(playlist.owner.equals(currentUser._id));


    // Step 1: Check if currentUser owns the playlist or is a collaborator
    if(
        !playlist.owner.equals(currentUser._id) &&
        !playlist.collaborators.includes(currentUser._id)
    ) {
        
        return res.status(400).json({err:"Not allowed"});
    }
    // Step 2: Check if the song is a valid song
    const song =  await Song.findOne({_id: songId}); 
    if(!song) {
        return res.status(304).json({err: "Song does not exist"});
    }

    // Step 3: we can now simply add the song to the playlist 
    playlist.songs.push(songId);
    await playlist.save();

    return res.status(200).json(playlist);
 }
);

module.exports = router;
