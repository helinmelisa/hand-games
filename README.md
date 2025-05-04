# 🖐️ Hand Games
An interactive full-stack game platform where users play gesture-based games using hand tracking. Built with React and Node.js, the project supports user authentication, gameplay tracking, and score storage.

---

## 🔧 Tech Stack

### Frontend
- React (Create React App)
- React Router
- Axios
- Webcam integration
- Hand Detection via MediaPipe / TensorFlow

### Backend
- Node.js & Express
- MongoDB + Mongoose
- JWT-based Authentication
- RESTful API

---

## ✨ Features

- 🔐 User Registration & Login with JWT  
- 🕹️ Six hand-tracked mini-games (e.g., Ball tapping memory game, Shape tracing accuracy game)   
- 🌟 Real-time gesture detection and feedback  
- 💾 Score tracking stored in MongoDB  
- 📊 Future leaderboard and game history support  
- 🧠 Modular game wrapper for reusability  

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/helinmelisa/hand-games.git
cd hand-games
```
### 2. Setup Backend

```bash
cd backend
npm install
npm run dev
```
Create a .env file

```bash
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```


## 📬 API Endpoints

| Method | Endpoint                | Description                      |
| ------ | ----------------------- | -------------------------------- |
| POST   | `/api/auth/register`    | Register a new user              |
| POST   | `/api/auth/login`       | Login and receive a JWT token    |
| POST   | `/api/games/score`      | Submit a game score (protected)  |


## 👩‍💻 Author
Helin Melisa Ergezen /
AI Developer & Full Stack Engineer
- GitHub – helinmelisa

