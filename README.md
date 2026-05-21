# FoodRxCheck: Food-Drug Interaction Checker

FoodRxCheck is a comprehensive mobile application designed to identify and manage potentially harmful interactions between medications and daily foods. Whether you are a patient looking to take your medicine safely or a healthcare provider seeking clinical details, FoodRxCheck provides clear, role-specific guidance.

---

## What is FoodRxCheck?

Many everyday foods and drinks can unexpectedly change how your medications work. For example, some juices, dairy products, or high-fiber foods can block a drug's absorption or trigger dangerous side effects. 

FoodRxCheck acts as a safety companion. Users can search for a drug or a food item to instantly see if there is a conflict, understand how severe the conflict is, and get clear instructions on how to take the medicine safely (for example, "avoid dairy 2 hours before and after taking this tablet").

---

## How It Works

The application provides tailored interfaces and tools for two distinct types of users:

### For Patients
* **Medication Instructions:** Easy-to-read guides on how and when to take specific medications.
* **Patient Counseling Guides:** Clear, simplified summaries of how different foods affect your drugs and how to manage your daily diet safely.
* **Interactive Search Tools:**
  * **Alphabetical Drug Directory:** Browse and find medications easily by name.
  * **Food-Drug Interaction Finder:** Search for a specific food (such as grapefruit, milk, or spinach) to instantly see which medications might interact with it.

### For Healthcare Professionals (HCPs)
* **Clinical Classifications:** Detailed drug profiles grouped by therapeutic class and subclass.
* **Pharmacological Insights:** Advanced access to the biological mechanism of action and the precise scientific reasons behind each interaction.
* **Severity Grading:** Interaction risks classified clearly (e.g., mild, moderate, or severe) to assist in clinical decision-making.
* **Advanced Search Tools:**
  * **Comprehensive Search:** Look up interactions by alphabetical drug lists, specific chemical classes, or food ingredients.
  * **Clinical Management Recommendations:** Professional guidelines on adjusting doses, changing intake timing, or choosing alternative therapies.

---

## Technical Specifications

For developers, administrators, and technical contributors, FoodRxCheck is built on a modern, scalable mobile architecture.

### Tech Stack
* **Framework:** React Native and Expo for a fast, cross-platform mobile experience (iOS and Android).
* **Programming Language:** TypeScript for robust, type-safe development.
* **Database & Authentication:** Supabase (Backend-as-a-Service) for secure user authentication and fast data queries.

### Database Architecture
The backend uses Supabase to power the search engines and user portals. The data is structured into two main tables:

#### 1. Healthcare Professional (HCP) Database
This table contains the detailed scientific data used to generate clinical insights.

| Field Name | Description |
| :--- | :--- |
| **Class** | The primary drug category (e.g., Antibiotics, Anticoagulants). |
| **Subclass** | The specific chemical subclass within the drug class. |
| **Drug** | The generic or brand name of the medication. |
| **Food** | The food or drink ingredients that cause an interaction. |
| **Mechanism Of Action** | The scientific explanation of the interaction at the biological level. |
| **Severity** | Clinical severity classification (Mild, Moderate, Severe). |
| **Management** | Actionable clinical steps to prevent or mitigate the interaction. |
| **Reference** | Verified medical sources, journals, or documentation. |

#### 2. Patient Database
This table contains simplified, patient-friendly guidance mapped to specific treatments.

| Field Name | Description |
| :--- | :--- |
| **General Instructions** | Straightforward instructions on taking the medication. |
| **Counseling** | Clear, non-technical counseling summaries and dietary recommendations. |

---

## Installation and Setup

To run a local copy of this application for development and testing, follow these steps.

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js** (LTS version recommended)
* **Expo CLI** (installed via `npm install -g expo-cli`)

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/KarunyaChavan/FoodRxCheck-Mobile-App.git
   cd FoodRxCheck-Mobile-App
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npx expo start
   ```

4. **Run on an Emulator or Physical Device:**
   * **Android:** Run `npm run android` to launch in an Android Emulator or connected device.
   * **iOS:** Run `npm run ios` to launch in the iOS Simulator (requires macOS and Xcode).

