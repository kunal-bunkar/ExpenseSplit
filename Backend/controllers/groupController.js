const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  const { name, memberIDs, description } = req.body;

  // Check for missing required fields
  if (!name || !Array.isArray(memberIDs)) {
    return res
      .status(400)
      .json({ message: "Group name and members are required." });
  }

  // Prevent group with no members
  if (memberIDs.length === 0) {
    return res
      .status(400)
      .json({ message: "Please add at least one member to the group." });
  }

  try {
    // Ensure current user is also in the group (optional, but logical)
    const uniqueMemberSet = new Set([...memberIDs, req.user.id]);
    const uniqueMembers = Array.from(uniqueMemberSet);

    const group = new Group({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: req.user.id,
      members: uniqueMembers,
    });

    await group.save();

    return res.status(201).json({
      message: "Group created successfully.",
      group,
    });
  } catch (err) {
    console.error("Create group error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error while creating group." });
  }
};

exports.getUserGroup = async (req, res) => {
  const userID = req.user.id;

  try {
    const groups = await Group.find({ members: userID })
      .populate("members", "name email") // optional: select fields
      .populate("createdBy", "name email"); // populate createdBy too

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/group/:id
// controllers/groupController.js

exports.getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId)
      .populate("members", "name email")
      .populate("createdBy", "name email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    console.error("Error in getGroupDetails:", error); // 👈 log the error
    res.status(500).json({ message: "Internal server error" });
  }
};
