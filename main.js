import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

document.addEventListener("DOMContentLoaded", () => {
  // Set up Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.set(208, -53, 170);

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "1"; // Keep the canvas above the background
  document.getElementById("container3d").appendChild(renderer.domElement);

  // const controls = new OrbitControls(camera, renderer.domElement);
  // Load the HDR environment map for reflections
  const rgbeLoader = new RGBELoader();
  rgbeLoader
    .setPath("https://raw.githubusercontent.com/miroleon/gradient_hdr_freebie/main/Gradient_HDR_Freebies/")
    .load("ml_gradient_freebie_01.hdr", function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;

      // Load the GLB model
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        "models/glass/scene.glb", // Change this path to the location of your GLB model
        function (gltf) {
          const model = gltf.scene;

          model.traverse((node) => {
            if (node.isMesh) {
              node.material.envMap = texture;
              node.material.envMapIntensity = 1.5;
              node.material.metalness = 1;
              node.material.roughness = 0.5; // Adjusted to make it less reflective
              node.material.needsUpdate = true;
            }
          });

          model.scale.set(300, 300, 300);
          model.position.y = -300;

          scene.add(model);
        },
        function (xhr) {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        function (error) {
          console.error("An error occurred while loading the model:", error);
        }
      );
    });

  // Create a grid helper
  const gridHelper = new THREE.GridHelper(5000, 50); // 500 is the size, 50 is the divisions
  gridHelper.position.y = -310;
  scene.add(gridHelper); // Add the grid helper to the scene

  // Create glassy bubbles with pastel colors
  const bubbleColors = [0x6bcef8, 0xfa75f5, 0xf9c67f];

  function shuffleColors(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  let shuffledColors = localStorage.getItem("shuffledBubbleColors");
  if (shuffledColors) {
    shuffledColors = JSON.parse(shuffledColors);
  } else {
    shuffledColors = shuffleColors([...bubbleColors]);
    localStorage.setItem("shuffledBubbleColors", JSON.stringify(shuffledColors));
  }

  const bubblePositions = [
    [-250, -100, 100],
    [200, -150, -100],
    [-150, 200, 50],
    [120, 160, 150],
    [250, 50, -80],
    [-200, 80, 200],
    
  ];

  const bubbleSize = 45;
  const bubbles = [];

  bubblePositions.forEach((position, index) => {
    const geometry = new THREE.SphereGeometry(bubbleSize, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: shuffledColors[index % shuffledColors.length],
      roughness: 0.8,
      metalness: 0,
      transparent: true,
      opacity: 1,
      transmission: 0,
      ior: 1.33,
      thickness: 1,
      envMap: scene.environment,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: -0.5,
    });

    const bubble = new THREE.Mesh(geometry, material);
    bubble.position.set(...position);
    scene.add(bubble);
    bubbles.push(bubble);
  });

  // Scroll-based camera position switching using GSAP
  const cameraPositions = [
    { x: 208, y: -45, z: 209 },
    { x: 170, y: -79, z: -0.9 },
    { x: 233, y: -92, z: -214 },
   
    { x: 249, y: 43, z: -341 },
    { x: 56, y: -400, z: 36 },
    { x: -205, y: -104, z: 306 },
    { x: 171, y: 2, z: 524 },
  ];

  const backgroundTexts = [
    "ANGELIKA THOMAS",
    "3D ARTIST",
    "CREATIVE DEVELOPER",
    "ARTISTIC",
    "VFX ARTIST",
    "CREATOR",
    "LEADER",
  ];

  let currentIndex = 0;
  let isScrolling = false;

  function setCameraPosition(index) {
    const position = cameraPositions[index];
    gsap.to(camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 2.5,
      ease: "expo.inOut", // Smoother easing function
      onUpdate: function () {
        camera.lookAt(0, 0, 0); // Ensure the camera looks at the center of the scene
      },
      onComplete: () => {
        isScrolling = false; // Allow scrolling again when the animation completes
      },
    });
  }

  function changeBackgroundText() {

    const newText = backgroundTexts[currentIndex]; // Change the text based on the current index

    // Fade out all text elements
    const textElements = [
      document.getElementById("text1"),
      document.getElementById("text2"),
      document.getElementById("text3"),
    ];

    // Fade out all text elements
    textElements.forEach((textElement) => {
      textElement.style.opacity = "0";
    });

    // Use a timeout to wait for the fade-out transition to complete
    setTimeout(() => {
      // Update all three paragraph texts to be the same
      textElements.forEach((textElement) => {
        textElement.textContent = newText; // Set the same text
        textElement.style.opacity = "1"; // Fade in after updating text
      });
    }, 1000); // Match this timeout with the CSS transition duration
  }

  window.addEventListener("wheel", (event) => {
    if (isScrolling) return;
  
    const scrollThreshold = 50; // Adjust sensitivity
    if (Math.abs(event.deltaY) > scrollThreshold) {
      isScrolling = true;
      if (event.deltaY < 0) {
        // Scrolling up
        currentIndex = currentIndex > 0 ? currentIndex - 1 : cameraPositions.length - 1; // Loop back to last index
      } else if (event.deltaY > 0) {
        // Scrolling down
        currentIndex = currentIndex < cameraPositions.length - 1 ? currentIndex + 1 : 0; // Loop back to first index
      }
      setCameraPosition(currentIndex);
      changeBackgroundText(); // Change background text on scroll
    }
  });

  // Initial camera position and text
  setCameraPosition(currentIndex);
  changeBackgroundText(); // Set the initial text

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1.2);
  pointLight.position.set(0, 500, 500);
  scene.add(pointLight);

  // Handle mouse movement
  const mouse = new THREE.Vector2();
  document.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  });

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    // console.log(`Camera Rotation: X: ${camera.position.x}, Y: ${camera.position.y}, Z: ${camera.position.z}`);
    // Move and rotate the scene based on mouse X position (Y-axis rotation only)
    const rotationSpeed = 0.2; // Speed of rotation
    scene.rotation.y += (mouse.x * rotationSpeed - scene.rotation.y) * 0.05; // Rotate only on Y axis

    // Animate bubbles up and down
    bubbles.forEach((bubble, index) => {
      bubble.position.y += 0.09 * Math.sin(Date.now() * 0.001 + index); // Up and down movement
    });

    renderer.render(scene, camera); // Render without bloom effect
  }

  animate();

  // Resize handler
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
