import { LoginActivity } from "../models/loginActivity.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getLoginHistory = asyncHandler (async (req, res) => {
    const {page= 1, limit = 10} = req.query
    const skip = parseInt((page - 1 ) * limit)
    const limitNum = parseInt(limit)

    const history = await LoginActivity.find({user: req.user._id}).skip(skip).limit(limitNum)
    const totalRecords = await LoginActivity.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalRecords / limit);
    res.status(200).json(
        new ApiResponse(
            200,
            history,
            "Log history fetched Successfully."
        )
    )
})