import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    avatar: {
      type: String,
      default: null,
    },

    cursorColor: {
      type: String,
      default: () => {
        const colors = [
          "#6366F1",
          "#8B5CF6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#3B82F6",
          "#EC4899",
        ];

        return colors[Math.floor(Math.random() * colors.length)];
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────
// HASH PASSWORD BEFORE SAVE
// ─────────────────────────────────────────────────────────────
userSchema.pre("save", async function () {

  // Only hash if password modified
  if (!this.isModified("password")) return;

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

});

// ─────────────────────────────────────────────────────────────
// COMPARE PASSWORD METHOD
// ─────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────────────────────
// CLEAN RESPONSE OBJECT
// ─────────────────────────────────────────────────────────────
userSchema.methods.toJSON = function () {

  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;

  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;