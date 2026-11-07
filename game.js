import * as THREE from 'three';

// ===== SETUP CƠ BẢN =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Trời xanh
scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ===== ÁNH SÁNG =====
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(30, 50, 30);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -60;
sun.shadow.camera.right = 60;
sun.shadow.camera.top = 60;
sun.shadow.camera.bottom = -60;
scene.add(sun);

// ===== SÂN BÓNG =====
const FIELD_W = 60;   // Chiều rộng (trục X)
const FIELD_L = 100;  // Chiều dài (trục Z)

// Cỏ
const grassGeo = new THREE.PlaneGeometry(FIELD_W, FIELD_L);
const grassMat = new THREE.MeshStandardMaterial({ color: 0x2d8a2d });
const grass = new THREE.Mesh(grassGeo, grassMat);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

// Vạch kẻ sân
function addLine(x, z, w, l) {
  const geo = new THREE.PlaneGeometry(w, l);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const line = new THREE.Mesh(geo, mat);
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.01, z);
  scene.add(line);
}

// Vạch giữa sân
addLine(0, 0, FIELD_W, 0.3);
// Vòng tròn giữa sân
const circleGeo = new THREE.RingGeometry(9, 9.3, 64);
const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const circle = new THREE.Mesh(circleGeo, circleMat);
circle.rotation.x = -Math.PI / 2;
circle.position.y = 0.02;
scene.add(circle);

// Vạch biên
addLine(-FIELD_W/2, 0, 0.3, FIELD_L);
addLine(FIELD_W/2, 0, 0.3, FIELD_L);
addLine(0, -FIELD_L/2, FIELD_W, 0.3);
addLine(0, FIELD_L/2, FIELD_W, 0.3);

// ===== KHUNG THÀNH =====
function createGoal(zPos, color) {
  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const GOAL_W = 14;
  const GOAL_H = 5;
  const postR = 0.15;

  // 2 cột
  const postGeo = new THREE.CylinderGeometry(postR, postR, GOAL_H, 12);
  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-GOAL_W/2, GOAL_H/2, 0);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, postMat);
  rightPost.position.set(GOAL_W/2, GOAL_H/2, 0);
  rightPost.castShadow = true;
  group.add(rightPost);

  // Xà ngang
  const crossGeo = new THREE.CylinderGeometry(postR, postR, GOAL_W, 12);
  const cross = new THREE.Mesh(crossGeo, postMat);
  cross.rotation.z = Math.PI / 2;
  cross.position.set(0, GOAL_H, 0);
  cross.castShadow = true;
  group.add(cross);

  // Lưới (đơn giản)
  const netGeo = new THREE.PlaneGeometry(GOAL_W, GOAL_H);
  const netMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.15,
    side: THREE.DoubleSide 
  });
  const net = new THREE.Mesh(netGeo, netMat);
  net.position.set(0, GOAL_H/2, zPos > 0 ? -1 : 1);
  group.add(net);

  group.position.z = zPos;
  return group;
}

const goalNorth = createGoal(-FIELD_L/2, 0x0066ff);
const goalSouth = createGoal(FIELD_L/2, 0xff3333);
scene.add(goalNorth, goalSouth);

// ===== CẦU THỦ =====
function createPlayer(color) {
  const group = new THREE.Group();
  
  // Thân (capsule)
  const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.2, 4, 12);
  const bodyMat = new THREE.MeshStandardMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.3;
  body.castShadow = true;
  group.add(body);
  
  // Đầu
  const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.5;
  head.castShadow = true;
  group.add(head);
  
  // Hướng nhìn (mũi tên nhỏ)
  const noseGeo = new THREE.ConeGeometry(0.15, 0.4, 8);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.3, 0.6);
  group.add(nose);
  
  return group;
}

const player = createPlayer(0x0066ff);
player.position.set(0, 0, 20);
scene.add(player);

// ===== BÓNG =====
const ballGeo = new THREE.SphereGeometry(0.4, 24, 24);
const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.castShadow = true;
ball.position.set(0, 0.4, 0);
scene.add(ball);

// Texture bóng đơn giản (các chấm đen)
const ballCanvas = document.createElement('canvas');
ballCanvas.width = 256;
ballCanvas.height = 256;
const ctx = ballCanvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, 256, 256);
ctx.fillStyle = 'black';
for (let i = 0; i < 8; i++) {
  ctx.beginPath();
  ctx.arc(Math.random()*256, Math.random()*256, 20, 0, Math.PI*2);
  ctx.fill();
}
const ballTexture = new THREE.CanvasTexture(ballCanvas);
ballMat.map = ballTexture;

// ===== VẬT LÝ BÓNG =====
const ballPhysics = {
  velocity: new THREE.Vector3(0, 0, 0),
  radius: 0.4,
  friction: 0.985,
  bounce: 0.6,
  gravity: -20
};

// ===== ĐIỀU KHIỂN =====
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

const playerSpeed = 12;
const sprintMultiplier = 1.8;
let playerVelocity = new THREE.Vector3();

// ===== CAMERA FOLLOW =====
const cameraOffset = new THREE.Vector3(0, 8, 12);
const cameraTarget = new THREE.Vector3();

// ===== GAME STATE =====
let score = { blue: 0, red: 0 };
let timeLeft = 90;
let lastTime = performance.now();

// ===== VÒNG LẶP CHÍNH =====
function animate() {
  requestAnimationFrame(animate);
  
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  
  updatePlayer(dt);
  updateBall(dt);
  updateCamera(dt);
  updateTimer(dt);
  checkGoals();
  
  renderer.render(scene, camera);
}

function updatePlayer(dt) {
  const speed = keys['ShiftLeft'] ? playerSpeed * sprintMultiplier : playerSpeed;
  const dir = new THREE.Vector3();
  
  if (keys['KeyW']) dir.z -= 1;
  if (keys['KeyS']) dir.z += 1;
  if (keys['KeyA']) dir.x -= 1;
  if (keys['KeyD']) dir.x += 1;
  
  if (dir.length() > 0) {
    dir.normalize();
    player.position.x += dir.x * speed * dt;
    player.position.z += dir.z * speed * dt;
    
    // Xoay cầu thủ về hướng di chuyển
    const targetAngle = Math.atan2(dir.x, dir.z);
    player.rotation.y = THREE.MathUtils.lerp(
      player.rotation.y, 
      targetAngle, 
      0.2
    );
  }
  
  // Giới hạn trong sân
  const limitX = FIELD_W / 2 - 1;
  const limitZ = FIELD_L / 2 - 1;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -limitX, limitX);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -limitZ, limitZ);
  
  // Sút bóng
  if (keys['Space']) {
    const ballPos2D = new THREE.Vector2(ball.position.x, ball.position.z);
    const playerPos2D = new THREE.Vector2(player.position.x, player.position.z);
    const dist = ballPos2D.distanceTo(playerPos2D);
    
    if (dist < 2.5) {
      const kickDir = new THREE.Vector3(
        Math.sin(player.rotation.y),
        0,
        Math.cos(player.rotation.y)
      );
      ballPhysics.velocity.x = kickDir.x * 25;
      ballPhysics.velocity.z = kickDir.z * 25;
      ballPhysics.velocity.y = 8; // Sút bổng nhẹ
      keys['Space'] = false; // Tránh sút liên tục
    }
  }
  
  // Đẩy bóng khi chạm (dribble)
  const ballDist = new THREE.Vector2(
    ball.position.x - player.position.x,
    ball.position.z - player.position.z
  ).length();
  
  if (ballDist < 1.2 && ballPhysics.velocity.length() < 5) {
    const pushDir = new THREE.Vector3(
      ball.position.x - player.position.x,
      0,
      ball.position.z - player.position.z
    ).normalize();
    ballPhysics.velocity.x += pushDir.x * 15 * dt;
    ballPhysics.velocity.z += pushDir.z * 15 * dt;
  }
}

function updateBall(dt) {
  // Áp dụng trọng lực
  ballPhysics.velocity.y += ballPhysics.gravity * dt;
  
  // Cập nhật vị trí
  ball.position.x += ballPhysics.velocity.x * dt;
  ball.position.y += ballPhysics.velocity.y * dt;
  ball.position.z += ballPhysics.velocity.z * dt;
  
  // Nảy trên mặt đất
  if (ball.position.y < ballPhysics.radius) {
    ball.position.y = ballPhysics.radius;
    if (Math.abs(ballPhysics.velocity.y) > 1) {
      ballPhysics.velocity.y = -ballPhysics.velocity.y * ballPhysics.bounce;
    } else {
      ballPhysics.velocity.y = 0;
    }
    // Ma sát
    ballPhysics.velocity.x *= ballPhysics.friction;
    ballPhysics.velocity.z *= ballPhysics.friction;
  }
  
  // Giới hạn trong sân (tường vô hình) - trừ cửa ghi bàn
  const limitX = FIELD_W / 2 - ballPhysics.radius;
  const limitZ = FIELD_L / 2 - ballPhysics.radius;
  
  if (Math.abs(ball.position.x) > limitX) {
    ball.position.x = Math.sign(ball.position.x) * limitX;
    ballPhysics.velocity.x *= -0.7;
  }
  
  // Chỉ chặn Z nếu không nằm trong khung thành
  const GOAL_W = 14;
  if (Math.abs(ball.position.z) > limitZ) {
    if (Math.abs(ball.position.x) > GOAL_W / 2) {
      ball.position.z = Math.sign(ball.position.z) * limitZ;
      ballPhysics.velocity.z *= -0.7;
    }
  }
  
  // Xoay bóng theo hướng di chuyển
  const speed = ballPhysics.velocity.length();
  if (speed > 0.1) {
    const axis = new THREE.Vector3(
      ballPhysics.velocity.z, 0, -ballPhysics.velocity.x
    ).normalize();
    ball.rotateOnWorldAxis(axis, speed * dt * 0.5);
  }
}

function updateCamera(dt) {
  // Camera theo sau cầu thủ
  const targetPos = new THREE.Vector3(
    player.position.x + cameraOffset.x,
    player.position.y + cameraOffset.y,
    player.position.z + cameraOffset.z
  );
  
  camera.position.lerp(targetPos, 0.1);
  
  cameraTarget.set(player.position.x, player.position.y + 1, player.position.z);
  camera.lookAt(cameraTarget);
}

function updateTimer(dt) {
  timeLeft -= dt / 6; // 1 giây thực = 1/6 giây game (trận 15s thực = 90s game)
  if (timeLeft < 0) timeLeft = 0;
  
  const min = Math.floor(timeLeft);
  const sec = Math.floor((timeLeft - min) * 60);
  document.getElementById('timer').textContent = 
    `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function checkGoals() {
  const GOAL_W = 14;
  const GOAL_LINE = FIELD_L / 2;
  
  // Ghi bàn vào khung thành Bắc (đội xanh ghi)
  if (ball.position.z < -GOAL_LINE && Math.abs(ball.position.x) < GOAL_W / 2) {
    score.blue++;
    resetBall();
    updateScoreUI();
    flashScreen(0x00aaff);
  }
  
  // Ghi bàn vào khung thành Nam (đội đỏ ghi)
  if (ball.position.z > GOAL_LINE && Math.abs(ball.position.x) < GOAL_W / 2) {
    score.red++;
    resetBall();
    updateScoreUI();
    flashScreen(0xff3333);
  }
}

function resetBall() {
  ball.position.set(0, ballPhysics.radius, 0);
  ballPhysics.velocity.set(0, 0, 0);
  player.position.set(0, 0, 20);
  player.rotation.y = 0;
}

function updateScoreUI() {
  document.getElementById('score').textContent = 
    `🔵 ${score.blue} - ${score.red} 🔴`;
}

function flashScreen(color) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; inset: 0;
    background: #${color.toString(16).padStart(6, '0')};
    opacity: 0.5; pointer-events: none;
    z-index: 100; transition: opacity 0.5s;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.style.opacity = '0', 50);
  setTimeout(() => flash.remove(), 600);
}

// ===== RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== BẮT ĐẦU =====
camera.position.set(0, 8, 32);
animate();