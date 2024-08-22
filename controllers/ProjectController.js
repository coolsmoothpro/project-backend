const db = require("../models");
const Project = db.project;
const { createTransport } = require('nodemailer');
const sendGridMail = require("@sendgrid/mail");

sendGridMail.setApiKey(process.env.EMAIL_SEND_API_KEY);

const transporter = createTransport({
    host: "smtp.gmail.com",
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

exports.createProject = async (req, res) => {
    try {
        const { client, projectName, projectDescription, dueDate, terms, expectedValue, milestone, members, status, tasks } = req.body;
        

        const newProject = new Project({
            client: client,
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
        const { id, projectName, projectDescription, terms, expectedValue, milestone } = req.body;

        const updatedProject = await Project.findByIdAndUpdate(
                id,
                {
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
        const encode = JSON.stringify(req.body);

        const base64EncodedStr = btoa(encode);

        await sendGridMail.send({
            from: process.env.EMAIL_SENDER,
            to: req.body.email,
            subject: 'You have received the invitation.',
            text: 'Accept',
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
        });

        return res.status(200).json({
            success: true,
        });


        // const mailOptions = {
        //     from: process.env.SMTP_EMAIL,
        //     to: req.body.email,
        //     subject: `You have received the invitation.`,
        //     text: `Accept`,
        //     html: `
        //         <p>
        //             Kindly click the button below to accept the invitation.
        //         </p>
        //         <a href="${process.env.CLIENT_URL}/welcome?token=${base64EncodedStr}" 
        //             style="
        //                 text-decoration: none;
        //                 color: #fff;
        //                 background-color: #14A800;
        //                 border-color: #14A800;
        //                 min-width: 100px;
        //                 border-radius: 3px;
        //                 padding: 0.375rem 0.5rem;
        //                 display: inline-block;
        //                 text-align: center;
        //             ">
        //             Accept
        //         </a>
        //     `
        // };
        
        // transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //         console.log(error);
                
        //         return res.status(200).json({
        //             success: false,
        //         });
        //     } else {
        //         return res.status(200).json({
        //             success: true,
        //         });
        //     }
        // });
       
        

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
        const firstname = decoded?.firstname;
        const lastname = decoded?.lastname;
        const avatar = decoded?.avatar;

        const project = await Project.findOne({ projectName: projectName });

        if(project) {

            const existingMember = project.members.find(member => member.email === email);

            if (existingMember) {
                return res.status(400).json({
                    success: false,
                    message: "Member with this email already exists in the project.",
                });
            }
        
            project.members.push({
                email: email,
                firstname: firstname,
                lastname: lastname,
                avatar: avatar
            });

            await project.save();

            return res.status(200).json({
                success: true,
            });
        }

        return res.status(400).json({ message: "The project is not existed!" });

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
                member: member
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
