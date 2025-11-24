// matter.js engine for bubble area
document.addEventListener('DOMContentLoaded', () => {
    const { Engine, Runner, Bodies, World, Events } = Matter;

    // Bubble image presets
    const photoPresets = {
        'bus': { path: 'images/bus.png', radius: 20 },
        'coffee': { path: 'images/coffee.png', radius: 40 },
        'stock': { path: 'images/samsung.png', radius: 36 }
    };

    // Select preset (default: coffee)
    const CURRENT_PRESET = 'coffee';
    const selectedPreset = photoPresets[CURRENT_PRESET];
    const radius = selectedPreset.radius;
    const PHOTO_PATH = selectedPreset.path;

    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    const CONTAINER_WIDTH = gameContainer.clientWidth;
    const CONTAINER_HEIGHT = gameContainer.clientHeight;

    // engine
    const engine = Engine.create();
    const world = engine.world;
    engine.world.gravity.y = 0.6;

    // create walls
    const wallOptions = { isStatic: true };
    const wallThickness = 80;

    const ground = Bodies.rectangle(
        CONTAINER_WIDTH / 2,
        CONTAINER_HEIGHT + wallThickness / 2,
        CONTAINER_WIDTH,
        wallThickness,
        wallOptions
    );

    const leftWall = Bodies.rectangle(
        -wallThickness / 2,
        CONTAINER_HEIGHT / 2,
        wallThickness,
        CONTAINER_HEIGHT,
        wallOptions
    );

    const rightWall = Bodies.rectangle(
        CONTAINER_WIDTH + wallThickness / 2,
        CONTAINER_HEIGHT / 2,
        wallThickness,
        CONTAINER_HEIGHT,
        wallOptions
    );

    World.add(world, [ground, leftWall, rightWall]);

    // compute N based on container area
    const innerWidth = CONTAINER_WIDTH;
    const innerHeight = CONTAINER_HEIGHT;
    const containerArea = innerWidth * innerHeight;
    const PACKING_DENSITY = 0.25; // reduce density for performance

    const singleBubbleArea = Math.PI * (radius * radius);
    const totalBubbleArea = containerArea * PACKING_DENSITY;
    const N = Math.max(6, Math.floor(totalBubbleArea / singleBubbleArea));

    // physical engine
    const matterBubbles = [];
    const domBubbles = [];

    for (let i = 0; i < N; i++) {
        const x = Math.random() * (innerWidth * 0.8) + (innerWidth * 0.1);
        const y = -Math.random() * 200;

        const bubbleBody = Bodies.circle(x, y, radius, {
            restitution: 0.3,
            friction: 0.05
        });
        matterBubbles.push(bubbleBody);

        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.style.width = `${radius * 2}px`;
        bubbleDiv.style.height = `${radius * 2}px`;
        bubbleDiv.style.backgroundImage = `url(${PHOTO_PATH})`;

        domBubbles.push(bubbleDiv);
        gameContainer.appendChild(bubbleDiv);
    }

    World.add(world, matterBubbles);

    // runner create & run
    const runner = Runner.create();
    Runner.run(runner, engine);

    Events.on(engine, 'afterUpdate', () => {
        for (let i = 0; i < matterBubbles.length; i++) {
            const body = matterBubbles[i];
            const div = domBubbles[i];

            const { x, y } = body.position;
            const angle = body.angle;

            const cssX = x - radius;
            const cssY = y - radius;

            div.style.transform = `translate(${cssX}px, ${cssY}px) rotate(${angle}rad)`;
        }
    });
});