const db = require("../models");
const User = db.user;
var bcrypt = require("bcryptjs");

exports.createSuperAdmin = async (req, res) => {
    try {
        const superAdmin = await User.findOne({
            role: "ADMIN",
        });
    
        if (!superAdmin) {
            const newPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);
            const newUser = new User({
                email: "super@admin.com",
                firstname: "Super",
                lastname: "Admin",  
                status: "Available",
                password: newPassword,
                role: "ADMIN",
            });
    
            await newUser.save();
        }
    } catch (err) {
        console.log(err);
    }
};

exports.createUser = async (req, res) => {
    try {
        const { avatar, email, firstname, lastname, role, phone, organization, department, accountType, status, location, address1, address2, zipcode, password} = req.body;

        const oldUser = await User.findOne({ email: email });

        if (oldUser) {
            return res.status(409).json({
                success: false,
                message: "The Email is already used!"
            });
        }

        const newPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email: email,
            firstname: firstname,
            lastname: lastname,
            role: role,
            phone: phone,
            organization: organization,
            department: department,
            accountType: accountType,
            status: status,
            location: location,
            address1: address1,
            address2: address2,
            zipcode: zipcode,
            avatar: avatar,
            password: newPassword,
          });
      
        const savedUser = await newUser.save();
        return res.status(200).json({
            success: true,
            user: {
                _id: savedUser._id,
                email: savedUser.email,
                firstname: savedUser.firstname,
                lastname: savedUser.lastname,
            },
        }); 

    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}

exports.getUserList = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({
            success: true,
            users: users,
        });
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
}