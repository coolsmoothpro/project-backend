const db = require("../models");
const MultiConnection = require('../config/multitenantDB');
const Team = db.team;

exports.createTeam = async (req, res) => {
    try {
        const { clientId, teamName, teamDescription, member } = req.body;

        const members = [];
        members.push(JSON.parse(member));

        if (clientId) {
            const tenantDB = await MultiConnection(clientId);
            const TenantModel = tenantDB.model('Team', Team.schema);

            const tenantTeam = new TenantModel({
                clientId: clientId,
                teamName: teamName,
                teamDescription: teamDescription,
                members: members,
            });
    
            await tenantTeam.save();

            return res.status(200).json({
                success: true,
            }); 
        } else {
            const newTeam = new Team({
                clientId: clientId,
                teamName: teamName,
                teamDescription: teamDescription,
                members: members,
            });

            await newTeam.save();
            return res.status(200).json({
                success: true,
                message: "Team has been created!"
            }); 
        }

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.teamList = async (req, res) => {
    try {
        const { clientId } = req.body;
        let teams;

        if (clientId) {
            const tenantDB = await MultiConnection(clientId);
            const TenantModel = tenantDB.model('Team', Team.schema);

            teams = await TenantModel.find();
        } else {
            teams = await Team.find();
        }

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
        const { clientId, teamId } = req.body;
        let team;

        if (clientId) {
            const tenantDB = await MultiConnection(clientId);
            const TenantModel = tenantDB.model('Team', Team.schema);

            team = await TenantModel.findById(teamId);

            if (team) {
                await TenantModel.findByIdAndDelete(teamId);

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
        } else {
            team = await Team.findById(teamId);

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
        }
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}