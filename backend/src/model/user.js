// import { kMaxLength } from "buffer";
import mongoose from "mongoose";
import { type } from "os";
// const ProfileSchema = new mongoose.Schema(, { _id: false });

const UserSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: [2, "Full name must be at least 2 characters long"],
    maxlength: [100, "Full name cannot exceed 50 characters"]  
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    minlength: [6, "Password must be at least 6 characters long"],
  },
  profile: {
      photo: { 
        type: String,        // path to photo file  
        default: "no photo",
        timestamps: true
      }, 
      dob: {                               //change dob to dateOfBirth
        type: Date 
      },
      address: { 
        type: String 
      },
      maritalStatus: { 
        type: String, 
        enum: ['single','married','divorced','widowed','other'], 
        default: 'single' 
      },
      currentLocation: { 
        type: String 
      },
      phone: { 
          type: String ,
      maxlength: [10, "Phone number cannot exceed 15 characters"]
      }
  },
  role: { 
    type: String, 
    enum: ['user','admin'], 
    default: 'user' 
  },
  isBlocked: { 
    type: Boolean, 
    default: false 
  },
  blockedReason: { 
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: { 
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// hash password before save if changed
// compare method

export default mongoose.model('User', UserSchema);
