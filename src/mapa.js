import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GranCanariaMap from "./GranCanaria.png";
import locals from "./establecimientos.csv";

// Scene variables.
let scene;
let renderer;
let camera;
let cameraControls;

// Map variables.
let map;
let mapx;
let mapy;
let scale = 5;

// Coord variables.
let minlon = -15.8366;
let minlat = 27.7338; 
let maxlon = -15.3570; 
let maxlat = 28.1819; 

// Start scene.
init();
animate();

/* Init scene. */
function init() {
  // Set scene, camera and renderer.
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  cameraControls = new OrbitControls(camera, renderer.domElement);

  // Load map.
  const granCanariaTexture = new THREE.TextureLoader().load(
    GranCanariaMap,
    /* Actions after load the map. */
    function(texture) {
      // Calculate the scale of the map.
      const textureAspectRatio = texture.image.width / texture.image.height;
      mapy = scale;
      mapx = scale * textureAspectRatio;
      
      setMap(0,0,0, mapx, mapy);
      
      // Set texture.
      map.material.map = texture;
      map.material.needsUpdate = true;

      // Get data.
      loadCsv(locals);
    }
  );

  // Resize listener.
  window.addEventListener('resize', onWindowResize, false);
}

/* Animation loop */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

/* 
Set map.
Although in this case whe are not placing
the map in any coords other than (0,0,0).
*/
function setMap(px, py, pz, sx, sy) {
  let geometry = new THREE.PlaneGeometry(sx, sy);
  let material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide});
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  map = mesh;
}

/* Load csv file */
function loadCsv(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error: " + response.statusText);
      }
      return response.text();
    })
    .then((content) => {
      parseCSV(content);
    })
    .then(() => {
      // Add points to the scene.
      for (let i = 0; i < data.length; i++) {
        sumDistances = data.reduce((acc, point) => acc + getDistance(data[i], point), 0);
        setSphere(data[i].x, data[i].y, 0, 0.02);
      }
    })
    .catch((error) => {
      console.error("Error loading CSV file:", error);
    });
}

/* Converts each line of the csv in a point in the map. */
function parseCSV(content) {
  // Split lines.
  const lines = content.split("\n");
  // Get rows.
  const headers = lines[0].split(";");
  // Get index,
  const index = {
    lat: 10,
    lon: 9,
    isle: 4
  };
  // Process each line.
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split(";");

    if (line.length == 0 || line[index.isle] != "Gran Canaria") continue; // Pass the empty line.

    // Map the coords to the map.
    let newY = Map2Range(
      line[index.lat],
      minlat,
      maxlat,
      -mapy / 2,
      mapy / 2
    );

    let newX = Map2Range(
      line[index.lon],
      minlon,
      maxlon,
      -mapx / 2,
      mapx / 2
    );

    // Add the point to the map array.
    setSphere(newX, newY, 0, 0.02);
  }
}

/* Calculate the distance between two points. */
function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function setSphere(px, py, pz, radius) {
  let geometry = new THREE.SphereGeometry(radius, 32, 32);
  let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
}

/* Normalize values */
function Map2Range(val, vmin, vmax, dmin, dmax) {
  let t = 1 - (vmax - val) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

/* Handle window resize */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
