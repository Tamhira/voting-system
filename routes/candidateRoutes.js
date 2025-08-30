const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate");
const User = require("./../models/user");
const { jwtAuthMiddleware } = require("../jwt");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if(user.role === "admin"){
      return true;
    }

  } catch (err) {
    return false;
  }
};

//to add a new candidate
router.post("/",jwtAuthMiddleware, async (req, res) => {
  try {
    if (! await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user has no admin role" });
    }
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    console.log("data saved");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//to update the candidate
router.put("/:candidateID",jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(404).json({ message: "user has no admin role" });
    }
    const candidateId = req.params.candidateID;
    const updatedCandidateDate = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateDate,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(403).json({ error: "Candidate not found" });
    }
    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//to delete the candidate
router.delete("/:candidateID",jwtAuthMiddleware,async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "user has no admin role" });
    }
    const candidateId = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("candidate deleted");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//to vote a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req,res) => {
  candidateID = req.params.candidateID;
  userId = req.user.id;
  try{
    const candidate = await Candidate.findById(candidateID);
    if(!candidate){
      return res.status(404).json({message: 'Candidate not found'});
    }
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    if(user.isVoted){
      return res.status(400).json({message: 'You have already voted'});
    }
    if(user.role=='admin'){
      return res.status(403).json({message: 'Admin is not allowed to vote'});
    }
    candidate.votes.push({user: userId})
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();
    return res.status(200).json({message: 'Vote recorded successfully'});
  }catch(err){
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

//to show the votes of a candiate
router.get('/vote/count', async (req, res) => {
  try{
      const candidate = await Candidate.find().sort({voteCount: 'desc'});
      const voteRecord = candidate.map((data)=>{
          return {
              party: data.party,
              count: data.voteCount
          }
      });
      return res.status(200).json(voteRecord);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});

module.exports = router;
