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

    if([fullName, username, email, password].some((field) => field.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    if(!email.includes("@")){
        throw new ApiError(400,"Invaid email address")
    }

    const alreadyExistUser = await User.find({
        email: email.trim(),
        username: username.trim()
    })

    if(!alreadyExistUser){
        throw new ApiError(400,"Username with this email or username already exist!")
    }
    const user = await User.create({
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password: password.trim(),
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

const uploadAvatar = asyncHandler(async (req,res) => {
    console.log(req.file)
    const avatarLocalPath = req.file.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avtar file is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400,"File is not uploaded to cloudinary")
    }

    req.user.avatar = avatar.url
    await req.user.save({validateBeforeSave: true})
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Avatar uploaded Successfully"
        )
    )
})

const uploadCoverImage = asyncHandler(async (req,res) => {
    console.log(req.file)
    const coverImageLocalPath = req.file.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage file is required")
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath)
    if(!coverImage){
        throw new ApiError(400,"File is not uploaded to cloudinary")
    }

    req.user.coverImage = coverImage.url
    await req.user.save({validateBeforeSave: true})
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "coverImage uploaded Successfully"
        )
    )
})
const login = asyncHandler(async (req,res) => {
    const {identifier, password} = req.body
    if(!identifier || !password){
        throw new ApiError(400,"username or password is required")
    }

    const existedUser = await User.findOne({
        $or: [{email: identifier.toLowerCase()},{username:identifier.toLowerCase()}]
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
            {loggedInUser,accessToken,refreshToken},
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

const logout = asyncHandler(async (req,res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {"returnDocument" : "after"}
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logged Out Successfully!"
        )
    )
})
export {registerUser,login,refreshAccessToken, uploadAvatar, uploadCoverImage}