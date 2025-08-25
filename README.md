# 🎉 EventHub - Event Management & RSVP System

EventHub is a full-stack web application that allows users to create, manage, and RSVP to events. Think of it as a simplified version of Eventbrite built with modern web technologies.

## ✨ Features

### 🎯 Core Functionality
- **User Authentication** - Register, login, and JWT-based session management
- **Event Management** - Create, read, update, and delete events
- **RSVP System** - Users can RSVP to events with status tracking (confirmed, pending, declined)
- **Event Categories** - Filter events by categories (Conference, Music, Workshop, etc.)
- **Capacity Management** - Track event attendance against capacity limits

### 🎨 User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Modern UI** - Beautiful gradient theme with smooth animations
- **User Profiles** - Complete user profiles with bio, contact info, and profile pictures
- **Dashboard** - Personal dashboard with event statistics and quick actions

### 📊 Advanced Features
- **Real-time Updates** - Automatic data refresh and state management
- **Email Notifications** - Ready for email integration (using Nodemailer)
- **RESTful API** - Clean API design with proper error handling
- **Database Relations** - Proper PostgreSQL relations with foreign keys

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd event-manager
   ```

2. **Setup the Backend**
   ```bash
    cd backend
    npm install

2. **Setup the Frontend**
    cd ../frontend
    npm install

3. **Database Setup**
    # Create database
    createdb event_manager

    # Run schema (from project root)
    psql -U postgres -d event_manager -f database/schema.sql

4. **Environment Configuration**
    # Create .env files in both backend and frontend directories
    # Example .env for backend:
    DB_USER=postgres
    DB_HOST=localhost
    DB_NAME=event_manager
    DB_PASSWORD=your_password
    DB_PORT=5432
    JWT_SECRET=your_super_secret_jwt_key
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password

    # Example .env for frontend:
    REACT_APP_API_URL=http://localhost:5000/api

5. **Run the Application**
    # Start backend server
    cd ../backend
    npm run dev
    Server runs on http://localhost:5000

    # Start frontend Development server
    cd ../frontend
    npm start
    Applications runs on http://localhost:3000

## 📂 Project Structure
```
event-manager/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── rsvps.js
│   │   └── notifications.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Events.js
│   │   │   ├── EventDetail.js
│   │   │   ├── CreateEvent.js
│   │   │   ├── MyEvents.js
│   │   │   ├── MyRSVPs.js
│   │   │   ├── Profile.js
│   │   │   └── Dashboard.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   └── schema.sql
└── README.md
```

## 🤝 Contributing
    1. Fork the repository
    2. Create a feature branch (git checkout -b feature/amazing-feature)
    3. Commit your changes (git commit -m 'Add amazing feature')
    4. Push to the branch (git push origin feature/amazing-feature)
    5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- PostgreSQL team for the reliable database
- Unsplash for providing free stock images for sample events
- Built with love using open-source technologies    

Happy Event Planning! 🎊