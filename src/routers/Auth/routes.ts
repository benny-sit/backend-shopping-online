import { Request, Response, NextFunction } from "express";
import Cart from "../../schemas/Cart";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

import User from '../../schemas/User';
import UserDetails, { IUserDetails } from "../../schemas/UserDetails";


const EXPIRES_IN = Number(process.env.EXPIRES_IN) || 60 * 60;
const REFRESH_EXPIRES_IN = Number(process.env.REFRESH_EXPIRES_IN) || 60 * 60 * 24 * 7;
const JWT_SECRET = () => process.env.JWT_SECRET || "secret";


async function register(req: Request, res: Response, next: NextFunction) {
    if(!req.body || !req.body.userDetails) return res.status(400).json({ error: {message: 'No Details'}});
    
    const details = {...req.body.userDetails, isAdmin: false};
    const userCart = new Cart();
    const userDetails = new UserDetails({...details, cart: userCart});
    req.body.userDetails = userDetails;


    let user;
    try {
        userCart.save();
        // Hash the password
        req.body.password = await bcrypt.hash(req.body.password, 10);
        // Create the user
        user = await User.create(req.body);

        const payload = {username: user.username, id: user.id, isAdmin: userDetails.isAdmin}

        const token = jwt.sign(payload, JWT_SECRET(), {
            expiresIn: EXPIRES_IN
        })
        const refreshToken = jwt.sign(payload, JWT_SECRET(), {
            expiresIn: REFRESH_EXPIRES_IN
        });

        userDetails.refreshToken = refreshToken;
        await userDetails.save();

        res.set("Authorization", "Bearer " + token);
        res.status(201).json({...payload, token});
    } catch (err) {
        let error: any = err;
        if(user) user.remove();
        if (error['code'] === 11000) return res.status(404).json({ error: {message:'username or email or Id number are already in use' }});
        res.status(400).json({error})
    }

}

async function login(req: Request, res: Response, next: NextFunction) {
    
    if(!req.body.username || !req.body.password) return res.status(400).json({error: {message:'Not specified username or password'}});

    try {
        const user = await User.findOne({username: req.body.username}).populate<{userDetails: IUserDetails}>('userDetails');
        if(!user) return res.status(404).json({error: {message: 'User not found'}});

        const match = await bcrypt.compare(req.body.password, user.password);
        if(!match) return res.status(401).json({error: {message:  'Invalid password'}});

        const payload = {username: user.username, id: user.id, isAdmin: user.userDetails.isAdmin}

        const token = jwt.sign(payload, JWT_SECRET(), {
            expiresIn: EXPIRES_IN
        })
        const refreshToken = jwt.sign(payload, JWT_SECRET(), {
            expiresIn: REFRESH_EXPIRES_IN
        });

        const userDetails = user.userDetails;
        userDetails.refreshToken = refreshToken;
        await userDetails.save();

        res.set("Authorization", "Bearer " + token);
        return res.status(200).json({...payload, token});
    } catch (error) {
        return res.status(500).json({error: error});
    }
}

// Using checkUser middleware to refresh
async function refreshToken(req: Request, res: Response, next: NextFunction) {
    const payload = {username: req.body.user.username, id: req.body.user.id, isAdmin: req.body.user.userDetails.isAdmin}
    return res.status(200).json(payload);
}

async function logout(req: Request, res: Response, next: NextFunction) {
    if(!req.headers.authorization) return res.status(401).json({error: 'Need authorization token'})
    const pureToken = req.headers.authorization.split(' ')[1]
    if(!pureToken) return res.status(400).json({error: {message: 'Token invalid'}});
    try {
        const {username} = jwt.verify(pureToken, JWT_SECRET());
        const user = await User.findOne({username}).populate<{userDetails: IUserDetails}>('userDetails');
        if(!user) return res.status(404).json({error: { message:  'User not found'}});

        user.userDetails.refreshToken = '';
        await user.userDetails.save();
        return res.status(200).json({success: "You Logged out"});
    } catch (error) {
        return res.status(401).json({error})
    }

}


export const AuthRoutes = {
    refreshToken,
    login,
    register,
    logout,
}