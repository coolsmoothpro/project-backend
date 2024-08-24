const db = require("../models");
const Team = db.team;

exports.createTeam = async (req, res) => {
    try {
        const { teamName, teamDescription, member } = req.body
        const members = [];
        members.push(JSON.parse(member));

        const newTeam = new Team({
            teamName: teamName,
            teamDescription: teamDescription,
            members: members,
        });

        await newTeam.save();
        return res.status(200).json({
            success: true,
            message: "Team has been created!"
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.teamList = async (req, res) => {
    try {
        const teams = await Team.find();

        return res.status(200).json({
            success: true,
            teams: teams,
        });
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.body;

        const team = await Team.findById(teamId);

        if (team) {
            await Team.findByIdAndDelete(teamId);

            return res.status(200).json({
                success: true,
                message: "Team has been deleted!"
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "Team not found!"
            });
        }        
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}