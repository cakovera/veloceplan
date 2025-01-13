# VelocePlan - Restaurant Discovery App

VelocePlan is a React Native mobile application that helps users discover restaurants near their location. Built with Expo and Firebase, it provides a seamless experience for finding and exploring local dining options.

## Features

- 🔐 User Authentication (Email & Google Sign-in)
- 📍 Location-based Restaurant Discovery
- 🗺️ Interactive Maps Integration
- ⭐ Restaurant Reviews and Ratings
- 👤 User Profile Management
- 💫 Custom Animations
- 🎨 Modern UI Design

## Tech Stack

- **Frontend Framework**: React Native with Expo
- **Authentication**: Firebase Auth
- **Maps Integration**: Google Maps API
- **Location Services**: Expo Location
- **UI Components**: Custom components with React Native Elements
- **Animations**: Lottie Animations
- **State Management**: React Context API
- **Navigation**: React Navigation

## Installation

1. Clone the repository:
bash
git clone https://github.com/cakovera/veloceplan.git

2. Install dependencies:
bash
cd veloceplan
npm install

3. Create a `.env` file in the root directory and add your API keys:
env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
FIREBASE_API_KEY=your_firebase_api_key


4. Start the development server:
bash
npx expo start

## Project Structure

veloceplan/
├── app/
│ ├── src/
│ │ ├── components/
│ │ ├── screens/
│ │ ├── context/
│ │ ├── services/
│ │ └── constants/
│ ├── assets/
│ └── index.tsx
├── .env
└── App.tsx



## Key Components

- **Authentication**: Implements email and Google sign-in using Firebase
- **Restaurant Discovery**: Uses Google Places API for restaurant data
- **Location Services**: Integrates device location for nearby searches
- **Profile Management**: Allows users to manage their profile and preferences
- **Custom Animations**: Implements smooth transitions and loading states

## Dependencies

- `expo`: ~49.0.0
- `react`: 18.2.0
- `react-native`: 0.72.5
- `@react-navigation/native`: ^6.1.9
- `firebase`: ^10.5.2
- `expo-location`: ~16.1.0
- `lottie-react-native`: ^6.4.1
- `expo-image-picker`: ~14.3.2

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Places API for restaurant data
- Firebase for authentication services
- Expo team for the amazing development framework
- React Native community for continuous support

## Contact

Your Name - [@yourgithub](https://github.com/cakovera)

Project Link: [https://github.com/cakovera/veloceplan](https://github.com/yourusername/veloceplan)