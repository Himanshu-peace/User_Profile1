// import { kMaxLength } from "buffer";
import mongoose from "mongoose";
// const ProfileSchema = new mongoose.Schema(, { _id: false });

const UserSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
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
    required: true 
  },
  profile: {
      photo: { 
        type: String     // path to photo file  
      }, 
      dob: { 
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
  }
}, { timestamps: true });

// hash password before save if changed

// compare method

export default mongoose.model('User2', UserSchema);
