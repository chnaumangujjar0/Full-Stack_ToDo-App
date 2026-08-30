import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
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
            required: function () {
                return this.authProvider === 'local';
            },
        },
        avatar: {
            type: String
        },
        coverImage: {
            type: String
        },
        refreshToken: {
            type: String
        },
        resetPasswordOtp: {
            type: String
        },
        resetPasswordExpiry: {
            type: Date
        },
        authProvider: {
            type: String,
            enum: ['local', 'auth0'],
            default: 'local', 
        },
        auth0Id: {
            type: String,
            unique: true,
            sparse: true, // Prevents errors for local users who don't have this field
        },
        isProfileComplete: {
            type: Boolean,
            default: true, // Local users are complete by default since they fill out the signup form
        },
    },
    {timestamps: true}
)

userSchema.pre("save", async function(){
    console.log("i am in password hashing")
    if(!this.isModified("password") || this.authProvider !== 'local') return;
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    if (this.authProvider !== 'local' || !this.password) {
    return false; 
  }
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function () {
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
userSchema.methods.generateRefreshToken = async function () {
    
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)