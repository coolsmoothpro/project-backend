const db = require("../models");
const Team = db.team;

exports.createTeam = async (req, res) => {
    try {
        const { team_name, team_description, industry } = req.body
        const newTeam = new Team({
            team_name: team_name,
            team_description: team_description,
            industry: industry,
        });

        await newTeam.save();
        return res.status(200).json({
            success: true,
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.teamList = async (req, res) => {
    try {
        const teams = await Team.find().select({
            avatar: 1,
            team_name: 1,
            team_description: 1,
            industry: 1,
            members: 1
        });
        return res.status(200).json({
            success: true,
            users: teams,
        });
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}