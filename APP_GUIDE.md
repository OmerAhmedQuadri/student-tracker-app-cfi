# 🏰 The Ultimate Guide to Our School App 🚀

Hello! Welcome to the Student Tracker App. Think of this app like a digital school building. Just like a real school has a Principal, Teachers, and Students, our app has **Admins**, **Mentors**, and **Students**.

We are going to explore every room (or "page") in this digital school. Buckle up! 🎒

---

## 🚪 The Front Door (`/login`)
Before anyone can enter the school, they have to show their ID card at the front door.
*   **What you do here:** You type in your secret name (email) and password.
*   **Where it goes:** If you are a Principal, you go to the Admin Office. If you are a Teacher, you go to the Staff Room. If you are a Student, you go to your Classroom!

---

## 🎩 The Admin (The Principal)
**Who is this?** The boss of the app. They can see everything and fix everything.

### 1. 🖥️ The Command Center (`/admin/dashboard`)
This is the big desk where the Principal sits.
*   **What's here?** Big charts and numbers!
*   **What it does:** Shows how many students are in there today, how many classes are running, and if everything is working smoothly.

### 2. 👥 The People List (`/admin/users` & `/admin/create-users`)
This is the school registry.
*   **What it does:** The Admin can add new people to the school. They can say, "You are a new Teacher!" or "You are a new Student!"
*   **Create Users:** A magical form to invite new friends to the app.

### 3. 🏫 The Classrooms (`/admin/batches` & `/admin/batch/:id`)
A "Batch" is just a fancy word for a Classroom.
*   **What it does:** Admins decide which students go into which classroom (like "Batch A" or "Batch B").
*   **Batch Details:** If you click on a classroom, you can see exactly who is sitting inside.

### 4. 📅 The Timetable (`/admin/sessions`)
This is the schedule on the wall.
*   **What it does:** Admins plan the lessons. "On Monday at 9 AM, we will learn Coding!"

### 5. 🙋‍♂️ The Master Attendance Sheet (`/admin/attendance`)
*   **What it does:** A big list of who came to school and who skipped class. The Admin knows all!

---

## 👩‍🏫 The Mentor (The Teacher)
**Who is this?** The person who teaches you cool things and helps you learn.

### 1. 🍎 The Teacher's Desk (`/mentor/dashboard`)
*   **What's here?** Upcoming classes and important notices.
*   **What it does:** Helps the teacher get ready for the day.

### 2. ✅ Roll Call (`/mentor/attendance`)
*   **What it does:** The teacher calls out names. "Are you here?"
*   **How it works:** They mark you as **Present** (Yay! 🎉) or **Absent** (Oh no! 👻).

### 3. 📜 The History Book (`/mentor/attendance/history`)
*   **What it does:** If the teacher forgets who came yesterday, they can look at this old book to check.

### 4. 🎓 My Students (`/mentor/students`)
*   **What it does:** A list of all the students in the teacher's class. They can see how well you are doing.

### 5. 📝 Daily Report Card (`/mentor/daily-progress`)
*   **What it does:** At the end of the day, the teacher writes a note about what the class learned. "Today we built a robot!" 🤖

### 6. 🌍 Show & Tell (`/mentor/external-activities`)
*   **What it does:** Teachers look at the cool projects students did outside of school (like posting on LinkedIn).

---

## 🎒 The Student (That's You!)
**Who is this?** The learner! You are here to grow and skills.

### 1. 🚀 My Dashboard (`/student/dashboard`)
This is your personal desk.
*   **What's here?**
    *   **Your Attendance:** Shows a green bar if you come to class every day.
    *   **Assignments:** Homework you need to do.
    *   **Classes:** What you are learning today.

### 2. 🏆 Show Off Your Skills (`/student/external-activities`)
This is like "Show and Tell".
*   **What it does:** Did you post about your code on LinkedIn? Did you win a contest?
*   **How it works:** You paste the link here so your teacher can see it and give you a high-five! 🙌

---

## 🌟 Pages for Everyone
There are some special places where everyone can go.

### 1. 🆔 My Profile (`/profile`)
*   **What it does:** This is your ID card. It has your name, your picture, and your details. You can change your password here if you forget it.

### 2. 🔔 Notifications (`/notifications`)
*   **What it does:** Ding! 🛎️ New message! This tells you if you have class or if someone graded your homework.

---
