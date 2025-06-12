
# Wordle Ranked - Competitive Word Game

🎯 Take Wordle to the next level! Compete with Elo rankings, climb from Bronze to Arch-Champion, and prove your word skills in this competitive twist on the classic game.

## 🚀 Live Demo

Visit the live demo at: [your-username.github.io/your-repo-name](https://your-username.github.io/your-repo-name)

## 🛠️ Local Development

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Deployment to GitHub Pages

### Automatic Deployment (Recommended)
This project includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages when you push to the main branch.

1. Fork or clone this repository
2. Go to your GitHub repository settings
3. Navigate to Pages → Source → GitHub Actions
4. Push to the main branch and the site will automatically deploy!

### Manual Deployment
```bash
# Build the project
npm run build

# The built files will be in the 'dist' folder
# Upload the contents of 'dist' to your GitHub Pages branch
```

### Important: Update the base URL
Before deploying, update the `base` property in `vite.config.ts`:
```typescript
base: process.env.NODE_ENV === 'production' ? '/your-actual-repo-name/' : '/',
```

## 🎮 Features

- **Competitive Ranking System**: Climb from Bronze to Arch-Champion
- **Elo Rating System**: Dynamic rating based on performance  
- **Placement Matches**: 10 initial games to determine your starting rank
- **Persistent Progress**: Your rank and stats are saved locally
- **Enhanced Word List**: Accepts a wide variety of English dictionary words
- **Responsive Design**: Works great on desktop and mobile

## 🏆 Ranking System

- **Unranked**: Placement matches (0-9 games)
- **Bronze**: 0-599 rating
- **Silver**: 600-999 rating  
- **Gold**: 1000-1399 rating
- **Platinum**: 1400-1799 rating
- **Diamond**: 1800-2199 rating
- **Master**: 2200-2599 rating
- **Grandmaster**: 2600-2999 rating
- **Arch-Champion**: 3000+ rating

## 🎯 How to Play

1. Guess the 5-letter word in 6 tries or less
2. Green tiles indicate correct letters in the right position
3. Yellow tiles indicate correct letters in the wrong position
4. Gray tiles indicate letters not in the word
5. Win games to increase your rating and climb the ranks!

## 🔧 Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** for UI components
- **Lucide React** for icons
- **React Query** for state management

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features  
- Submit pull requests

## ⭐ Show Your Support

If you enjoy this game, please give it a star on GitHub!
