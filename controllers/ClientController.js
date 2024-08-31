const MultiConnection = require('../config/multitenantDB');
const Connection=require("../config/db");
const db = require("../models");
const Client = db.client;

const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

exports.createClient = async (req, res) => {
    const {
        clientId, avatar, organization, address, website, clientPhone,
        admins, status, location, address1, address2, zipcode, role
    } = req.body;

    const password = "";
    
    try {
        // Connect to the tenant's database
        const tenantDB = await MultiConnection(clientId);

        // Load the Client model for this tenant
        const TenantClientModel = tenantDB.model('Client', Client.schema);

        // Create a new client in the tenant's database
        
        for (const admin of admins) {
            const client = await TenantClientModel.findOne({ email: admin.email });

            if (client) continue;

            const tenantClient = new TenantClientModel({
                clientId: clientId, 
                avatar: avatar, 
                organization: organization, 
                address: address, 
                website: website, 
                clientPhone: clientPhone,
                firstname: admin.firstname, 
                lastname: admin.lastname, 
                email: admin.email, 
                adminPhone: admin.adminPhone, 
                status: status, 
                location: location, 
                address1: address1, 
                address2: address2, 
                zipcode: zipcode, 
                role: role, 
                password: password
            });

            await tenantClient.save();

            await Connection();
            const MainClientModel = db.mongoose.model('Client', Client.schema);

            const mainClient = new MainClientModel({
                clientId: clientId, 
                avatar: avatar, 
                organization: organization, 
                address: address, 
                website: website, 
                clientPhone: clientPhone,
                firstname: admin.firstname, 
                lastname: admin.lastname, 
                email: admin.email, 
                adminPhone: admin.adminPhone, 
                status: status, 
                location: location, 
                address1: address1, 
                address2: address2, 
                zipcode: zipcode, 
                role: role, 
                password: password
            });

            await mainClient.save();
          
            const base64EncodedStr = btoa(JSON.stringify({ email: admin.email }));
            const url = `http://${clientId}.${process.env.CLIENT_URL}/reset-password-form?token=${base64EncodedStr}`;

            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: admin.email,
                subject: `Set Password.`,
                text: `Set Password`,
                html: `
                    <p>
                        Your account has been created! Kindly click the button below to set the password.
                    </p>
                    <a href="${url}"
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
                        Set Password
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
                        message: "Client has been created successfully!"
                    });
                }
            });

        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create client" });
    }
};

exports.getClients = async (req, res) => {
    try {
        await Connection();
        
        const clients = await Client.find();

        return res.status(200).json({
            success: true,
            clients: clients,
        });

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password, subdomain } = req.body;

        const tenantDB = await MultiConnection(subdomain);

        const ClientModel = tenantDB.model('Client', Client.schema);

        const foundUser = await ClientModel.findOne({ email: email });

        if (foundUser) {
            const isValidPassword = await bcrypt.compare(
                password,
                foundUser.password
            );

            if (isValidPassword) {
                const payload = {
                    id: foundUser._id,
                    role: foundUser.role,
                    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
                };
                const token = jwt.sign(payload, process.env.SECRET_KEY, {
                    algorithm: "HS256",
                });

                return res
                    .status(200)
                    .json({ message: "Login successful", token: token, user: foundUser });
            } else {
                return res.status(401).json({ message: "Invalid password" });
            }
        } else {
            return res.status(404).json({ message: "Email not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.resetPasswordAction = async (req, res) => {
    try {        
        const { email, password, subdomain } = req.body;

        const tenantDB = await MultiConnection(subdomain);

        const ClientModel = tenantDB.model('Client', Client.schema);

        const user = await ClientModel.findOne({
            email: email,
        });
    
        if (user) {
            const newPassword = await bcrypt.hash(password, 10);
            user.password = newPassword;
    
            await user.save();

            return res
                .status(200)
                .json({ message: "Password has been set successfully", success: true });
        } else {
            return res
                .status(404)
                .json({ message: "Email is invalid", success: false });
        }
    } catch (err) {
        console.log(err);
    }
}

exports.getById = async (req, res) => {
    try {
        const { client } = req.body;

        const clients = await Client.find({ clientId: client });

        return res.status(200).json({
            success: true,
            clients: clients
        });

    } catch (err) {
        console.log(err);
    }
}