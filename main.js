import Phaser from 'phaser';
import MainMenu from './scenes/MainMenu';
import GameScene from './scenes/GameScene';

console.log('Initializing Phaser Game'); // Add this line

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [MainMenu, GameScene]
};

if (!window.game) {
    window.game = new Phaser.Game(config);
    console.log('Phaser Game Initialized'); // Add this line
}

console.log('main.js executed'); // Add this line
