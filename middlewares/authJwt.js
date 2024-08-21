const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token,
        process.env.SECRET_KEY,
        (err, decoded) => {
        if (err) {
            return res.status(401).send({
            message: "Unauthorized!",
            });
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
        res.status(500).send({ message: err });
        return;
        }

        Role.find(
        {
            _id: { $in: user.role }
        },
        (err, role) => {
            if (err) {
            res.status(500).send({ message: err });
            return;
            }

            for (let i = 0; i < role.length; i++) {
            if (role[i].name === "admin") {
                next();
                return;
            }
            }

            res.status(403).send({ message: "Require Admin Role!" });
            return;
        }
        );
    });
};


const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};
module.exports = authJwt;