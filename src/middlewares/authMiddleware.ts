import { Response, Request, NextFunction } from "express";
import User from "../schemas/User";
import { IUserDetails } from "../schemas/UserDetails";
const jwt = require("jsonwebtoken");

const JWT_SECRET = () => process.env.JWT_SECRET || "secret";
const EXPIRES_IN = Number(process.env.EXPIRES_IN) || 60 * 60;
const REFRESH_EXPIRES_IN = Number(process.env.REFRESH_EXPIRES_IN) || 60 * 60 * 24 * 7;

export async function checkUser(req: Request, res: Response, next: NextFunction) {
    if(!req.headers.authorization) return res.status(401).json({error: { message: 'Need authorization token'}});
    const pureToken = req.headers.authorization.split(' ')[1]
    if(!pureToken) return res.status(400).json({error: {message: 'Token invalid'}});

    let refreshToken
    let user;
    let decoded
    try {
        decoded = jwt.decode(pureToken, JWT_SECRET());
        jwt.verify(pureToken, JWT_SECRET());
    } catch (error: any) {
        if (error.message && error.message === "invalid signature") return res.status(401).json({error});
    }

    if (!decoded) return res.status(400).json({error: { message: 'Cannot decode the token'}})
    
    try {
        user = await User.findOne({username: decoded.username}).populate<{userDetails: IUserDetails}>('userDetails');
    } catch (error) {
        return res.status(400).json({error});
    }
    
    if(!user) return res.status(404).json({error: {message:  'User not found'}});
    if(!user.userDetails.refreshToken) return res.status(404).json({error: {message: 'You are not logged in'}});
    refreshToken = user.userDetails.refreshToken;

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET());
    } catch (error) {
        // Destroy invalid token
        user.userDetails.refreshToken = '';
        try {
            await user.save();
        } catch (err) {
            return res.status(400).json({error: err});
        }
        return res.status(401).json({error})
    }

    // Token is valid and refresh token is valid
    const token = jwt.sign({username: user.username}, JWT_SECRET(), {
        expiresIn: EXPIRES_IN
    })

    req.body.user = user;
    res.set('Authorization', "Bearer " + token);
    next();
}

// Use checkAdmin after use checkUser
export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
    if(!req.body.user || !req.body.user.userDetails) return res.status(401).json({ error: { message: "No credentials provided" } });

    if(!req.body.user.userDetails.isAdmin) return res.status(401).json({ error: { message: "User is not an administrator" } });
    
    next();
}
