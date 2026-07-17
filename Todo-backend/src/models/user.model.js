import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userScehma = new Schema({
        fullName: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email: {
            type: String,
            required: true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    },
    {timestamps: true}
)

userScehma.pre("save", async function(){
    console.log("i am in password hashing")
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10)
})

userScehma.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userScehma.methods.generateAccesToken = async function () {
    return await jwt.sign(
        {
           _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userScehma.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET
        }
    )
}

export const User = mongoose.model("User",userScehma)