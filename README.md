# 🚀 Advanced ToDo App & Profile Management System

A **production-ready Full-Stack MERN (MongoDB, Express.js, React.js, Node.js)** application designed with a strong emphasis on **security, scalability, and user experience**. The application combines an advanced task management system with secure authentication, interactive profile management, and a custom email verification workflow.

Built using modern web technologies and industry best practices, this project demonstrates the implementation of secure RESTful APIs, responsive frontend architecture, efficient media handling, and modular backend design suitable for real-world applications.

---

## 📖 Overview

The application utilizes **JWT-based authentication** and **bcrypt password hashing** to ensure secure user access, while protected API endpoints restrict sensitive operations to authenticated users only.

A custom **OTP verification system**, powered by **Nodemailer** and SMTP services, enables secure password updates by sending time-sensitive **6-digit verification codes** directly to the user's registered email address.

Users can personalize their accounts by updating profile information, uploading avatar and cover images, and previewing images instantly before uploading. Image uploads are securely handled through **Multer** using `multipart/form-data`, with the backend architecture prepared for seamless integration with cloud storage providers such as **Cloudinary**.

The frontend is built with **React.js** and **Tailwind CSS**, delivering a responsive and interactive user interface featuring reusable components, asynchronous toast notifications, custom modal dialogs, and real-time image previews.

---

## ✨ Features

### 🔐 Authentication & Security

- JWT-based Authentication & Authorization
- Password Hashing using bcrypt
- Protected REST API Routes
- Custom Authentication Middleware
- Secure Password Update Workflow
- Email-based OTP Verification

### 👤 Profile Management

- Update Personal Information
- Upload Avatar Image
- Upload Cover Image
- Live Client-side Image Preview
- Secure Image Upload Handling

### 📧 Email Verification

- SMTP Integration with Nodemailer
- Secure 6-Digit OTP Generation
- Time-sensitive Verification Codes
- Password Change Verification

### 📁 Media Handling

- Image Upload using Multer
- Multipart/Form-Data Support
- Cloud Storage Ready (Cloudinary Compatible)
- Secure Backend File Processing

### ✅ Task Management

- Create Tasks
- Update Tasks
- Delete Tasks
- Manage Personal ToDo List
- Responsive Task Interface

### 🎨 User Interface

- Responsive Design
- Built with Tailwind CSS
- React Functional Components
- React Hooks & Context API
- Custom Blur Background Modals
- Real-time Toast Notifications
- Instant Image Preview (`URL.createObjectURL`)

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Context API
- React Hooks
- Tailwind CSS
- Axios
- React-Toastify

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Nodemailer
- Multer
- Cloudinary

---

## 📂 Project Architecture

```
Frontend (React)
        │
        ▼
 REST API (Express.js)
        │
 ┌──────┴────────┐
 │               │
 ▼               ▼
MongoDB      File Uploads -> Cloudinary
(Mongoose)    (Multer)
        │
        ▼
 Email Service
 (Nodemailer)
```

---

## 🔒 Security Features

- JWT Authentication
- Password Encryption with bcrypt
- Protected API Endpoints
- OTP-Based Password Verification
- Secure Image Upload Pipeline
- Authentication Middleware
- Input Validation
- RESTful API Security

---

## 🚀 Highlights

- Production-ready MERN Stack Architecture
- Modular Backend Structure
- Responsive & Modern UI
- Secure Authentication System
- Advanced Profile Management
- Custom Email Verification Workflow
- Cloud Storage Ready Media Handling
- Scalable REST API Design
- Clean and Maintainable Codebase

---


## 👨‍💻 Author

Developed as a **Full-Stack MERN Application** to demonstrate modern web development practices, secure authentication workflows, scalable backend architecture, and responsive frontend design.