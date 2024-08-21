const db = require("../models");
const User = db.user;
const Role = db.role;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


exports.signup = async (req, res) => {
    try {
        const { email, firstname, lastname, password} = req.body;
        const newPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email: email,
            firstname: firstname,
            lastname: lastname,
            password: newPassword,
        });
    
        const savedUser = await newUser.save();
        return res.status(200).json({
            success: true,
            user: {
                _id: savedUser._id,
                email: savedUser.email,
                firstName: savedUser.firstname,
                lastName: savedUser.lastname,
                role: savedUser.role,
                avatar: savedUser.avatar
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(501).json({ message: "Internal server error" });
    }
};

exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const foundUser = await User.findOne({ email: email });

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

exports.getCurrentUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        
        if (user) {
            return res.status(200).json({
                success: true,
                user: user
            });
        } else {
            return res.status(401).json({
                success: false,
            });
        }


    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
} 

exports.updateUser = async (req, res) => {
    try {
        const { _id, avatar, email, firstname, lastname, phone, organization, department, accountType, location, address1, address2, zipcode} = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                email: email,
                firstname: firstname,
                lastname: lastname,
                avatar: avatar,
                phone: phone,
                organization: organization,
                department: department,
                accountType: accountType,
                location: location,
                address1: address1,
                address2: address2,
                zipcode: zipcode,
            },
        );

        return res.status(200).json({
            success: true,
            user: {
              _id: updatedUser._id,
              email: updatedUser.email,
              firstname: updatedUser.firstname,
              lastname: updatedUser.lastname,
              avatar: updatedUser.avatar,
            },
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const { _id, newPassword } =  req.body;
        const password = await bcrypt.hash(newPassword, 10);
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                password: password
            },
        );

        return res.status(200).json({
            success: true,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const encode = JSON.stringify(req.body);
        const base64EncodedStr = btoa(encode);

        const user = await User.findOne({ email: email });

        if (user) {

            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: req.body.email,
                subject: `Reset Password.`,
                text: `Reset Password`,
                html: `
                    <p>
                        Kindly click the button below to reset the password.
                    </p>
                    <a href="${process.env.CLIENT_URL}/reset-password-form?token=${base64EncodedStr}"
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
                        Reset
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
                    });
                }
            });

            return res.status(200).json({
                success: true,
            });

        } else {
            return res.status(200).json({
                success: false,
                message: "User is not existed!"
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.resetPasswordAction = async (req, res) => {
    try {        
        const { email, password } = req.body;
        const user = await User.findOne({
            email: email,
        });
    
        if (user) {
            const newPassword = await bcrypt.hash(password, 10);
            user.password = newPassword;
    
            await user.save();

            return res
                .status(200)
                .json({ message: "Password has been reset successfully", success: true });
        } else {
            return res
                .status(404)
                .json({ message: "Email is invalid", success: false });
        }
    } catch (err) {
        console.log(err);
    }
}