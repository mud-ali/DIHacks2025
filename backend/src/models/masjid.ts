import mongoose from "mongoose";
import { supportedCalculationMethods } from "../data/enums.ts";

mongoose.set("strictQuery", false);

const masjidSchema = new mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    calculationMethod: {
        type: String,
        enum: {
            values: supportedCalculationMethods,
            message: 'Invalid calculation method'
        }
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v: string) {
                return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
            },
            message: 'Invalid phone number format'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v: string) {
                return !v || /^[A-Z0-9\._+-]+@[A-Z0-9\.-]+\.[A-Z]{2,}$/i.test(v);
            },
            message: 'Invalid email format'
        }
    },
    services: [{
        type: String,
        required: false
    }],
    prayerTimes: {
        fajr: {
            type: String,
            validate: {
                validator: function(v: string) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Prayer time must be in HH:MM format'
            }
        },
        dhuhr: {
            type: String,
            validate: {
                validator: function(v: string) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Prayer time must be in HH:MM format'
            }
        },
        asr: {
            type: String,
            validate: {
                validator: function(v: string) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Prayer time must be in HH:MM format'
            }
        },
        maghrib: {
            type: String,
            validate: {
                validator: function(v: string) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Prayer time must be in HH:MM format'
            }
        },
        isha: {
            type: String,
            validate: {
                validator: function(v: string) {
                    return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
                },
                message: 'Prayer time must be in HH:MM format'
            }
        }
    }
});

masjidSchema.set("toJSON", {
    transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Masjid = mongoose.model("Masjid", masjidSchema);

export default Masjid;
