import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const userSchema = new mongoose.Schema({
    id: Number,
    name: String,
    email: {
        type: String,
        required: true,
        match: [
            /^[A-Z0-9\._+-]+@[A-Z0-9\.-]+\.[A-Z]{2,}$/i,
            "Invalid email address",
        ],
    },
    admin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Masjid'
    }],
    passwordHash: String
});

userSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const User = mongoose.model("User", userSchema);

export default User;
