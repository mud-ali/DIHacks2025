import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const eventSchema = new mongoose.Schema({
    id: Number,
    name: String,
    location: String,
    startTime: Date,
    endTime: Date,
    description: String
});

eventSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
