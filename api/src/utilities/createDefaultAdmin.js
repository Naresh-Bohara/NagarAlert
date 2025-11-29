import bcrypt from "bcryptjs";
import UserModel from "../modules/users/user.model.js";

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = "sysadmin@gmail.com"; // change if you want
    const existing = await UserModel.findOne({ email: adminEmail });

    if (existing) {
      console.log("✔ Admin already exists");
      return;
    }

    const hashedPass = await bcrypt.hash("Admin@123", 10);

    await UserModel.create({  
      name: "Super Admin",
      email: adminEmail,
      password: hashedPass,
      role: "system_admin",
      status: "active", 
      profileImage: "", 
    });

    console.log("Default Admin Created Successfully");
    console.log("Email:", adminEmail);
    console.log("Password: Admin@123");
  } catch (err) {
    console.log("Failed to create admin:", err.message);
  }
};
