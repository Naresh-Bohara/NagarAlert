# 🏙️ NagarAlert - Civic Issue Reporting Platform

## 📖 About
NagarAlert is a multi-municipality platform where citizens can report city problems, municipalities fix them efficiently, and local businesses sponsor relevant services.

The platform aims to improve civic management while keeping users engaged and rewarded.

---

## 👥 User Roles
- **👑 System Admin** – Manages the entire platform  
- **🏢 Municipality Admin** – Manages one municipality  
- **👥 Citizen** – Reports and tracks city issues  
- **🔧 Field Staff** – Fixes reported problems  
- **💼 Business Sponsor** – Displays local ads  

---

## 🔄 How It Works
1. Citizen reports a problem with photo & location.  
2. Municipality assigns staff to resolve the issue.  
3. Staff updates status and uploads proof of completion.  
4. Citizen receives reward points when problem is fixed.  
5. Local business ads show to relevant users.  

---

## 🚀 Features
- 📸 Photo reporting with GPS location  
- 🔄 Real-time status tracking  
- 💰 Reward points system for citizens  
- 🎯 Local business ads targeted to users  
- 📱 Mobile-friendly and responsive  

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express  
- **Database:** MongoDB (Atlas or local)  
- **Authentication:** JWT with Role-Based Access Control  
- **File Upload:** Cloudinary  
- **Real-time Updates:** Socket.IO  
- **Validation:** Joi  
- **Email Notifications:** Nodemailer  

---

## 📁 Project Structure

nagaralert-backend/
├── src/
│   ├── config/
│   │   ├── database.config.js
│   │   ├── cloudinary.config.js
│   │   └── upload.config.js
│   ├── constants/
│   │   ├── http-status-code.constants.js
│   │   └── response-status.constants.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   └── request-validator.middleware.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── municipalities/
│   │   ├── reports/
│   │   ├── staff/
│   │   └── sponsors/
│   ├── services/
│   │   ├── mail.service.js
│   │   └── cloudinary.service.js
│   └── utilities/
│       └── helpers.js
├── .env
├── package.json
└── server.js

---

## ⚙️ Environment Variables
Use `.env` for sensitive keys. Example:
PORT=
MONGODB_URL=
MONGODB_NAME=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SALT_ROUNDS=

SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_SERVICE=
SMTP_USER=
SMTP_PWD=
SMTP_FROM=

JWT_SECRET=



---

## 🏗 Installation & Setup

### Clone the repository:
```bash
git clone https://github.com/Naresh-Bohara/NagarAlert.git
cd NagarAlert


Install dependencies:
yarn install
# or
npm install


Configure .env file with your credentials.
Start the server:
yarn start
# or
npm run start


✅ Status

✅ Project setup complete

🚧 Building core modules: Users, Reports, Staff, Sponsors

Next: Municipalities → Reports → Staff → Sponsors


💡 Contributing

Fork the repository

Create a feature branch (feature/my-feature)

Open a Pull Request for review

📄 License

ISC License

Built with
Built with ❤️ by Team KMC for cleaner, smarter cities 🏙️
--
If you want, I can also **upgrade it with badges, DB diagram, and quick-start table** — this makes it **look very professional on GitHub**.  

Do you want me to do that?

