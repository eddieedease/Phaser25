class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    preload() {
        // Load any assets for the main menu if needed
    }

    create() {
        this.add.text(400, 300, 'Press SPACE to Start', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}

export default MainMenu;
