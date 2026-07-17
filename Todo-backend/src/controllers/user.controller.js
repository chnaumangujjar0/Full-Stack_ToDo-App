import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import { uploadToCloudinary } from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/apiResponse.js"

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

export {registerUser}