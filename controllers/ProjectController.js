const db = require("../models");
const Project = db.project;
const { createTransport } = require('nodemailer');
const User = require("../models/User");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: true,
    tls: {
        rejectUnauthorized: false,
    },
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

exports.createProject = async (req, res) => {
    try {
        const { client, projectLogo, projectName, projectDescription, dueDate, terms, expectedValue, milestone, members, status, tasks } = req.body;
        

        const newProject = new Project({
            client: client,
            projectLogo: projectLogo,
            projectName: projectName,
            projectDescription: projectDescription,
            dueDate: dueDate,
            attachedFiles: req.files,
            terms: terms,
            expectedValue: expectedValue,
            milestone: milestone,
            members: members,
            status: status,
            tasks: tasks
        });

        await newProject.save();

        return res.status(200).json({
            success: true,
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.projectList = async (req, res) => {
    try {
        const projects = await Project.find();

        if (projects) {
            return res.status(200).json({
                success: true,
                projects: projects,
            });
        } else {
            return res.status(200).json({
                success: false,
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.getProject = async (req, res) => {
    try {
        const { id } = req.body;
        const project = await Project.findById(id);

        return res.status(200).json({
            success: true,
            project: project
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
} 

exports.updateProjectStatus = async (req, res) => {
    try {
        const id = req.body.taskId;
        const status = req.body.newStatus;

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            {
                status: status
            }
        );

        return res.status(200).json({
            success: true,
            project: {
                _id: updatedProject._id,
            },
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
} 

exports.updateProject = async (req, res) => {
    try {
        const { id, projectLogo, projectName, projectDescription, terms, expectedValue, milestone } = req.body;

        const updatedProject = await Project.findByIdAndUpdate(
                id,
                {
                    projectLogo: projectLogo,
                    projectName: projectName,
                    projectDescription: projectDescription,
                    terms: terms,
                    expectedValue: expectedValue,
                    milestone: milestone
                }
        );

        return res.status(200).json({
            success: true,
            project: {
                _id: updatedProject._id,
            },
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
} 

exports.sendInvite = async (req, res) => {
    try {
        const { email, projectName } = req.body;
        const project = await Project.findOne({ projectName: projectName });

        if(project) {

            const existingMember = project.members.find(member => member.email === email);

            if (existingMember) {
                return res.status(200).json({
                    success: false,
                    message: "Member with this email already exists in the project.",
                });
            }

            const encode = JSON.stringify(req.body);

            const base64EncodedStr = btoa(encode);

            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: req.body.email,
                subject: `You have received the invitation.`,
                text: `Accept`,
                html: `
                    <p>
                        Kindly click the button below to accept the invitation.
                    </p>
                    <a href="${process.env.CLIENT_URL}/welcome?token=${base64EncodedStr}" 
                        style="
                            text-decoration: none;
                            color: #fff;
                            background-color: #14A800;
                            border-color: #14A800;
                            min-width: 100px;
                            border-radius: 3px;
                            padding: 0.375rem 0.5rem;
                            display: inline-block;
                            text-align: center;
                        ">
                        Accept
                    </a>
                `
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                    
                    return res.status(200).json({
                        success: false,
                    });
                } else {
                    return res.status(200).json({
                        success: true,
                        message: "Invitation has been sent!"
                    });
                }
            });
        } else {
            return res.status(201).json({
                success: false,
                message: "Project not found!"
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.acceptInvite = async (req, res) => {
    try {
        const { token } = req.body;
        const decoded = JSON.parse(atob(token));
        const projectName = decoded?.projectName;
        const email = decoded?.email;
        const user = await User.findOne({email: email});
        const firstname = user?.firstname;
        const lastname = user?.lastname;
        const avatar = user?.avatar;
        const role = user?.role;
        const phone = user?.phone;

        const project = await Project.findOne({ projectName: projectName });

        if(project) {

            const existingMember = project.members.find(member => member.email === email);

            if (existingMember) {
                return res.status(201).json({
                    success: false,
                    message: "Member with this email already exists in the project.",
                });
            } else {
        
                project.members.push({
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                    avatar: avatar,
                    role: role,
                    phone: phone
                });

                await project.save();

                return res.status(200).json({
                    success: true,
                    message: "You are a member of a new project."
                });
            }
        }

        return res.status(201).json({ message: "The project is not existed!" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.createTask = async (req, res) => {
    try {
        const { projectId, taskName, taskDescription, dueDate, status, member } = req.body;

        const project = await Project.findById(projectId);

        if (project) {
            project.tasks.push({
                taskName: taskName,
                taskDescription: taskDescription,
                dueDate: dueDate,
                status: status,
                member: JSON.parse(member)
            });

            await project.save();

            return res.status(200).json({
                success: true,
                message: "Task has been created!"
            }); 
        }

        return res.status(200).json({
            success: false,
            message: "The project is not found."
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.taskList = async (req, res) => {
    try {
        const { projectId } = req.body;

        const project = await Project.findById(projectId);

        if (project) {           

            return res.status(200).json({
                success: true,
                tasks: project.tasks
            }); 
        }

        return res.status(200).json({
            success: false,
            message: "The project is not found."
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.updateTaskStatus = async (req, res) => {
    try {
        const { projectId, taskName, newStatus } = req.body;

        const project = await Project.findById(projectId);

        if (project) {
            const taskIndex = project.tasks.findIndex((task) => task.taskName === taskName);

            if (taskIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }

            project.tasks[taskIndex].status = newStatus;
            
            project.markModified('tasks');

            await project.save();

            return res.status(200).json({
                success: true,
                project: project
            });
        }

        return res.status(200).json({
            success: false,
            message: "Project not found!"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
} 

exports.deleteProject = async (req, res) => {
    try {
        const { projectId } = req.body;

        const project = await Project.findById(projectId);

        if (project) {
            await Project.findByIdAndDelete(projectId);

            return res.status(200).json({
                success: true,
                message: "Project has been deleted!"
            });
        } else {
            return res.status(200).json({
                success: false,
                message: "Project not found!"
            });
        }        

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.uploadProjectFile = async (req, res) => {
    try {
        const { projectId } = req.body;

        const project = await Project.findById(projectId);

        req.files?.forEach((file) => {
            project.attachedFiles.push(file);
        });
        
        await project.save();

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteFile = async (req, res) => {
    try {
        const { projectId, filename } = req.body;

        const project = await Project.findById(projectId);

        project.attachedFiles = project.attachedFiles?.filter(file => file.filename !== filename);
        
        await project.save();

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteMember = async (req, res) => {
    try {
        const { projectId, email } = req.body;

        const project = await Project.findById(projectId);

        project.members = project.members?.filter(member => member.email !== email);
        
        await project.save();

        return res.status(200).json({
            success: true,
            message: "Member has been deleted!"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteTask = async (req, res) => {
    try {
        const { projectId, deleteTaskName } = req.body;

        const project = await Project.findById(projectId);

        project.tasks = project.tasks?.filter(task => task.taskName !== deleteTaskName);
        
        await project.save();

        return res.status(200).json({
            success: true,
            message: "Task has been deleted!"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.editTask = async (req, res) => {
    try {
        const { projectId, taskName, taskDescription, dueDate, member } = req.body;

        const project = await Project.findById(projectId);

        if (project) {

            const taskIndex = project.tasks.findIndex((task) => task.taskName === taskName);

            if (taskIndex !== -1) {
                project.tasks[taskIndex].taskName = taskName;
                project.tasks[taskIndex].taskDescription = taskDescription;
                project.tasks[taskIndex].dueDate = dueDate;
                project.tasks[taskIndex].member = JSON.parse(member);
                
                project.markModified('tasks');
        
                try {
                    await project.save();

                    return res.status(200).json({
                        success: true,
                        message: "Task has been updated!"
                    });
                } catch (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to save the project. Please try again.",
                        error: error.message
                    });
                }
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Task not found!"
                });
            }
        }

        return res.status(200).json({
            success: false,
            message: "The project is not found."
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}