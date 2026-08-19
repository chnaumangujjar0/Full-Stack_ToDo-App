import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
export const getAllNotifications = asyncHandler(async (req,res) => {
    
    const notifications = await Notification.find({
        user: req.user._id,
        isRead: false
    })
    console.log(notifications)

    return res.status(200).json(
        new ApiResponse(
            200,
            notifications,
            "Noification fetched successfully"
        )
    )

})

export const markAsRead = asyncHandler (async (req,res) => {
    const {notificationId} = req.params
    console.log(notificationId)
    const checkexistence = await Notification.findById(notificationId)

    if(!checkexistence){
        throw new ApiError(400,"notification doest not exist.")
    }

    const readed = await Notification.findByIdAndUpdate(
        notificationId,
        {
            $set: {isRead : true}
        },
        {"returnDocument": "after"}
    )

    return res.status(200).json(
        200,
        {},
        "Notification mark as readed"
    )
}) 