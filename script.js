// matter.js engine
const { Engine, Runner, Bodies, World, Composite, Events } = Matter;

// flask size
const CONTAINER_WIDTH = 375;
const CONTAINER_HEIGHT = 650;

// presets
const photoPresets = {
    'coffee': {
        path: 'images/coffee.png',
        originalWidth: 960,
        originalHeight: 720,
        radius: 15
    },
    'bus': {
        path: 'images/bus.png',
        originalWidth: 960,
        originalHeight: 720,
        radius: 25
    },
    'stock': {
        path: 'images/samsung.png',
        originalWidth: 960,
        originalHeight: 720,
        radius: 45
    }
};

// select preset
const CURRENT_PRESET = 'stock'; 

const selectedPreset = photoPresets[CURRENT_PRESET];
const radius = selectedPreset.radius;
const PHOTO_PATH = selectedPreset.path;

const gameContainer = document.getElementById('game-container');

// engine
const engine = Engine.create();
const world = engine.world;
engine.world.gravity.y = 0.5;

// create flask
const wallOptions = {
    isStatic: true,
    render: { visible: false }
};
const wallThickness = 40;

const ground = Bodies.rectangle(
    CONTAINER_WIDTH / 2, 
    CONTAINER_HEIGHT + (wallThickness / 2), 
    CONTAINER_WIDTH, 
    wallThickness, 
    wallOptions
);
const leftWall = Bodies.rectangle(
    -(wallThickness / 2), 
    CONTAINER_HEIGHT / 2, 
    wallThickness, 
    CONTAINER_HEIGHT, 
    wallOptions
);
const rightWall = Bodies.rectangle(
    CONTAINER_WIDTH + (wallThickness / 2), 
    CONTAINER_HEIGHT / 2, 
    wallThickness, 
    CONTAINER_HEIGHT, 
    wallOptions
);
const ceiling = Bodies.rectangle(
    CONTAINER_WIDTH / 2,
    -(wallThickness / 2),
    CONTAINER_WIDTH,
    wallThickness,
    wallOptions
);

World.add(world, [ground, leftWall, rightWall]);


// Radius -> N
const innerWidth = CONTAINER_WIDTH;
const innerHeight = CONTAINER_HEIGHT;
const containerArea = innerWidth * innerHeight;
const PACKING_DENSITY = 0.9; 

const singleBubbleArea = Math.PI * (radius * radius);
const totalBubbleArea = containerArea * PACKING_DENSITY;
const N = Math.floor(totalBubbleArea / singleBubbleArea);

console.log(`Radius : ${radius}px -> N : ${N}`);

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
    for (let i = 0; i < N; i++) {
        const body = matterBubbles[i];
        const div = domBubbles[i];

        const { x, y } = body.position;
        const angle = body.angle;
        
        const cssX = x - radius;
        const cssY = y - radius;

        div.style.transform = `translate(${cssX}px, ${cssY}px) rotate(${angle}rad)`;
    }
});

// 나중에 버블 애니메이션 / 계산 로직 / 목표 달성 트리거 등을
// 여기에서 구현하면 됨.

// 예시: 개발용으로 모달 열고 닫는 간단한 헬퍼 (원하면 지워도 됨)
document.addEventListener("DOMContentLoaded", () => {
  const celebrateModal = document.querySelector(".goal-modal-celebrate");
  const savingModal = document.querySelector(".goal-modal-saving");
  const closes = document.querySelectorAll(".goal-modal-close");

  // 필요하면 콘솔에서 아래처럼 테스트 가능:
  // openCelebrate(), openSaving();

  window.openCelebrate = () => {
    celebrateModal.classList.add("is-open");
  };
  window.openSaving = () => {
    savingModal.classList.add("is-open");
  };

  closes.forEach((btn) => {
    btn.addEventListener("click", () => {
      celebrateModal.classList.remove("is-open");
      savingModal.classList.remove("is-open");
    });
  });
});
