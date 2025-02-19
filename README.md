# FoodRxCheck - React Native App
<p align="center">
  <img src="https://github.com/user-attachments/assets/599beb82-7431-459c-af7d-17d3f8cd82af" width="100" height="100" style="border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);">
</p>

## 📌 Overview
FoodRxCheck is a **React Native** application designed to facilitate the understanding and management of food-drug interactions. The app provides tailored functionalities based on user roles: **Healthcare Professionals (HCPs)** and **Patients**. Built with **TypeScript**, it uses **Supabase** as the backend database for authentication and data management.

## 🚀 Features
### 👨‍⚕️ **For Patients**
- 📖 **View General Instructions** on drug usage.
- 💊 **Access Patient Counseling** for food-drug interactions.
- 🔍 **Search Drugs Based On:**
  - 🔠 **Alphabetical list**
  - 🍎 **Food-Drug Interaction Finder** (search food to see affected drugs)
  
### 🏥 **For Healthcare Professionals (HCPs)**
- 📋 **View Detailed Drug Classifications** and interactions.
- 🔬 **Access Mechanisms of Action & Severity of Interactions**.
- 🔍 **Search Drugs By:**
  - 🔠 **Alphabetical list**
  - 🏷️ **Class-wise categorization**
  - 🍎 **Food-Drug Interaction Lookup** (search food to see affected drugs)

## 🏗️ Tech Stack
- **React Native** - Cross-platform mobile framework.
- **TypeScript** - Strongly typed programming language.
- **Supabase** - Backend-as-a-Service for database and authentication.
- **Expo** - Simplified React Native development.

## 🛠️ Database (Supabase)
FoodRxCheck uses **Supabase** as the backend database. The database consists of two main tables:

### 1️⃣ **HCP Database** (For Healthcare Professionals)
| Field | Description |
|------------|-------------|
| **Class** | Drug category (e.g., antibiotics) |
| **Subclass** | Subdivision within the drug class |
| **Drug** | Name of the drug |
| **Food** | Associated food items causing interactions |
| **Mechanism Of Action** | Explanation of the interaction mechanism |
| **Severity** | Level of severity (mild, moderate, severe) |
| **Management** | Recommended steps to manage the interaction |
| **Reference** | Source or documentation for the information |

### 2️⃣ **Patient Database**
| Field | Description |
|------------|-------------|
| **General Instructions** | Directions for drug usage |
| **Counseling** | Simplified food-drug interaction + dosage recommendations |

## 🛠️ Installation & Setup
### Prerequisites
Ensure you have the following installed:
- 🖥️ **Node.js** (LTS version recommended)
- 📦 **Expo CLI** (`npm install -g expo-cli`)

### Steps to Run
1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/FoodRxCheck.git
   cd FoodRxCheck_React_Native
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start the development server**
   ```sh
   npx expo start
   ```
4. **Run on a device/emulator**
   - 📱 **Android**: Use `npm run android`
   - 🍏 **iOS**: Use `npm run ios` (Mac & Xcode required)

