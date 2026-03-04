const JobTracker = require("../models/jobTracker");

exports.getTrackedJobs = async (req, res) => {
  try {
    const jobs = await JobTracker.find({ candidateId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tracked jobs" });
  }
};

exports.addTrackedJob = async (req, res) => {
  try {
    const newJob = new JobTracker({
      ...req.body,
      candidateId: req.user._id,
    });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ message: "Error adding tracked job", error: err.message });
  }
};

exports.updateTrackedJob = async (req, res) => {
  try {
    const updatedJob = await JobTracker.findOneAndUpdate(
      { _id: req.params.id, candidateId: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedJob) return res.status(404).json({ message: "Job not found" });
    res.json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: "Error updating tracked job" });
  }
};

exports.deleteTrackedJob = async (req, res) => {
  try {
    const deletedJob = await JobTracker.findOneAndDelete({
      _id: req.params.id,
      candidateId: req.user._id,
    });
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting tracked job" });
  }
};
