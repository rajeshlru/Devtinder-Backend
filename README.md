<!-- README-TOP -->
<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/rajeshlru/Devtinder-Backend">
    <img src="https://www.shutterstock.com/image-vector/backend-icon-style-glyph-600nw-2534278585.jpg" alt="Logo" width="120" height="120">
  </a>

  <h1 align="center">DevTinder Backend ⚡️</h1>

  <p align="center">
    The Engine Powering Developer Connections. Swipe Right on Code.
    <br />
    <br />
    <a href="https://github.com/rajeshlru/Devtinder-Frontend"><strong>Explore the Frontend »</strong></a>
    <br />
    <br />

  </p>
</div>

<!-- SHIELDS -->
<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/your-username/devtinder-backend?style=for-the-badge)
![GitHub Forks](https://img.shields.io/github/forks/your-username/devtinder-backend?style=for-the-badge)
![MIT License](https://img.shields.io/github/license/your-username/devtinder-backend?style=for-the-badge)
![Pull Requests](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)

</div>

<br/>

<!-- ABOUT THE PROJECT -->
## 🧐 About The Project

> **DevTinder is a social networking app built *for* developers, *by* developers. Our mission is to bridge the gap between talented developers, fostering collaboration, innovation, and career growth through meaningful connections.**

This repository is the backbone of DevTinder. It houses the robust, scalable, and secure server-side logic that makes finding your next collaborator, mentor, or tech co-founder as easy as a swipe.

We handle everything from secure authentication and detailed profile management to a smart matching algorithm and a high-performance, real-time chat infrastructure. Built with a modern Node.js stack, this RESTful API is designed for efficiency, security, and developer-friendliness.

---

## ✨ Architectural Highlights

*   **🚀 High-Performance API:** Built with Node.js and Express.js for a non-blocking, asynchronous, and fast request-response cycle.
*   **🔐 Stateless JWT Authentication:** Secure, stateless authentication ensures that our API is scalable and robust. Endpoints are protected with middleware for authorized access.
*   **💬 Real-Time Communication:** A dedicated WebSocket layer built with **Socket.IO** enables instant, event-driven communication for a seamless live chat experience.
*   **🧠 Smart Connection Logic:** The core algorithm processes user actions (`interested`/`ignored`) and creates a "connection" when two developers express mutual interest.
*   **🗄️ Scalable Data Modeling:** Leverages MongoDB with Mongoose for a flexible and scalable NoSQL database structure, perfect for storing complex developer profiles.
*   **🛡️ Robust Security Practices:** Includes data validation, sanitization, password hashing (bcrypt), and environment variable management to protect user data.
*   **🕒 Scheduled Background Jobs:** Utilizes **cron jobs** for automated background tasks, such as database cleanup, sending summary notifications, or updating user stats.

---

## 🛠️ Tech Stack

This project is powered by a modern and powerful set of technologies.

<p align="center">
  <a href="https://nodejs.org/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  </a>
  &nbsp;
  <a href="https://expressjs.com/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  </a>
  &nbsp;
  <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  </a>
  &nbsp;
    <a href="https://socket.io/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io">
  </a>
  &nbsp;
  <a href="https://jwt.io/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
  </a>
  &nbsp;
  <a href="https://mongoosejs.com/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose">
  </a>
</p>

---

<!-- GETTING STARTED -->
## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You'll need Node.js, npm/yarn, and a MongoDB instance ready.

*   Node.js (v16 or later)
*   npm or yarn
*   MongoDB URI (from a local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your-username/devtinder-backend.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd devtinder-backend
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Set up your environment variables**
    Create a `.env` file in the root and add your configuration:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_and_long_jwt_key
    PORT=5000
    ```
5.  **Start the server**
    *   For development with auto-reloading:
        ```sh
        npm run dev
        ```
    *   For production:
        ```sh
        npm start
        ```
The API will be live at `http://localhost:5000`.

---

## 🗺️ API Endpoints

Our API is organized around REST principles. All endpoints are prefixed with `/api`.

| Scope         | Method | Endpoint                          | Description                               | Auth      |
|---------------|:------:|-----------------------------------|-------------------------------------------|:---------:|
| **Auth**      | `POST` | `/auth/signup`                    | Register a new user account.              | 🌍 Public |
|               | `POST` | `/auth/login`                     | Authenticate a user and get a token.      | 🌍 Public |
|               | `POST` | `/auth/logout`                    | Log out the current user.                 | 🔒 Private|
| **Profile**   | `GET`  | `/profile/view`                   | Get the logged-in user's profile.         | 🔒 Private|
|               | `PATCH`| `/profile/edit`                   | Update the logged-in user's profile.      | 🔒 Private|
|               | `PATCH`| `/profile/password`               | Update the logged-in user's password.     | 🔒 Private|
| **User**      | `GET`  | `/user/feed`                      | Get a feed of potential user profiles.    | 🔒 Private|
|               | `GET`  | `/user/connections`               | Get a list of all successful connections. | 🔒 Private|
|               | `GET`  | `/user/requests/received`         | View all incoming connection requests.    | 🔒 Private|
| **Request**   | `POST` | `/request/send/:status/:userId`   | Send a request (`interested` or `ignored`).| 🔒 Private|
|               | `POST` | `/request/review/:status/:reqId`  | Review a request (`accepted` or `rejected`).| 🔒 Private|

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🌳 Project Structure

The project is structured following a clean and scalable **modular pattern** to ensure maintainability and separation of concerns. All core logic resides within the `src` directory.

```
/
├── 📁 src/
│   ├── 📁 config/         # Environment variables, database config, etc.
│   ├── 📁 crons/          # Logic for all scheduled background jobs.
│   ├── 📁 middlewares/    # Custom Express middleware (e.g., auth, error handling).
│   ├── 📁 modules/        # Core feature modules (User, Profile, Connection).
│   │   │   └── (Each module contains its own controller, model, services, etc.)
│   ├── 📁 routes/         # API route definitions, mapping endpoints to controllers.
│   ├── 📁 utils/          # Reusable utility functions (e.g., email sender, API features).
│   └── 📜 app.js          # Main application entry point: initializes Express.
├── 📜 .env.example      # Template for environment variables.
├── 📜 .gitignore
├── 📜 package.json
└── 📜 README.md
```

---

<!-- CONTRIBUTING -->
## 🤝 Contributing

Contributions are the lifeblood of open source. We welcome any contributions that can make this project better!

If you have a suggestion, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<!-- LICENSE -->
## 📜 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

---

<!-- CONTACT -->
## 🙏 Support & Contact

Rajesh - [LinkedIn](https://www.linkedin.com/in/rajesh-elluru-97ba6b356/) - rajeshelluru143@gmail.com

Project Link: [https://github.com/your-username/devtinder-backend](https://github.com/your-username/Devtinder-Backend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
