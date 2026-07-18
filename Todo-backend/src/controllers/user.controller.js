import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"

 const generateAccessAndRefreshToken = async (id) => {
    try {
        const user = await User.findById(id)
    
        const accessToken = await user.generateAccesToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(400,"Something went Wrong while generating tokens")
    }
}


const registerUser = asyncHandler(async (req,res) => {
    const {fullName, username, email, password} = req.body

    if([fullName, username, email, password].some((field) => field.trim() == "")){
        throw new ApiError(400,"All fields are required")
    }

    if(!email.includes("@")){
        throw new ApiError(400,"Invaid email address")
    }

    const avatarLocalPath = req.files?.avatar[0].path
    const coverImageLocalPath = req.files?.coverImage[0].path
    if(!avatarLocalPath || !coverImageLocalPath){
        throw new ApiError(400,"both Files are required")
    }
    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar || !avatar){
        throw new ApiError(400,"Error while Uploading file to cloudinary")
    }

    const user = await User.create({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password: password.trim(),
        avatar: avatar?.url,
        coverImage: coverImage?.url
    })
    const existedUser = await User.findById(user._id).select("-password -refreshToken")
    if(!existedUser){
        throw new ApiError(401,"User not created successfully!")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            existedUser,
            "user registered successfully!"
        )
    )
})

const login = asyncHandler(async (req,res) => {
    const {username, email, password} = req.body
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })

    if(!existedUser){
        throw new ApiError(400,"This user with this username or email does not exist!")
    }

    const isVslidPassword = await existedUser.isPasswordCorrect(password)

    if(!isVslidPassword){
        throw new ApiError(400,"Invalid password")
    }

    const {accessToken, refreshToken} = generateAccessAndRefreshToken(existedUser._id)

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refresTokeh",refreshToken)
    .json(
        new ApiResponse(
            200,
            loggedInUser,
            "User Loggedin successfully!"
        )
    )
    
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401,"Unauthorize access")
    }

    try {
        const decodedtoken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
       const user = await User.findById(decodedtoken._id)
    
       if(!user){
        throw new ApiError(400,"User not found")
       }
       
       if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(400,"Refresh token is expired or used")
       }

       const options = {
            httpOnly: true,
            secure: true 
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options) 
            .json(
                new ApiResponse(
                    200,
                    {
                        user: user,
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Token Generated Successfully"
                )
            )
    } catch (error) {
        if( error instanceof ApiError){
            throw error
        }

        throw new ApiError(401, error?.message || "Access token refresh failed")
    }
})

export {registerUser,login,refreshAccessToken}