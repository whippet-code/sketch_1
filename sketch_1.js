// p5.js sketch inspired by Aleksandra Jovanić's "line()"

let cols, rows;
let cellWidth, cellHeight;
let margin = 50; // Margin around the grid

// --- Parameters to tweak ---
let gridResolution = 25; // How many cells across the inner drawing area
let placementNoiseScale = 0.1; // Scale for placement decision noise (smaller = larger clusters)
let placementThreshold = 0.45; // Likelihood of placing a tile (0 to 1)

let distortionNoiseScale = 0.5; // Scale for corner distortion noise
let distortionMagnitude = 15; // Max pixels a corner can be offset

let linesPerTile = 15; // Number of lines inside each tile

let noiseSeedValue; // To make noise predictable if needed

function setup() {
  createCanvas(800, 800);
  background(245, 245, 235); // Off-white background
  stroke(50); // Default stroke color (dark grey/black)
  noFill();
  // strokeCap(SQUARE); // Maybe useful for plotter look later

  // noiseSeedValue = random(1000); // Uncomment for random results each run
  // noiseSeed(noiseSeedValue);      // Uncomment for random results each run
  // console.log("Noise Seed:", noiseSeedValue); // Log seed if using one

  let innerWidth = width - 2 * margin;
  let innerHeight = height - 2 * margin;

  // Adjust cellWidth based on resolution to fit innerWidth
  cellWidth = innerWidth / gridResolution;
  // Calculate rows based on cellWidth to keep cells roughly square
  rows = floor(innerHeight / cellWidth);
  // Recalculate innerHeight and cellHeight based on integer number of rows
  cellHeight = cellWidth; // Keep cells square
  innerHeight = rows * cellHeight;
  // Recalculate margin vertically to center the adjusted grid
  let marginY = (height - innerHeight) / 2;


  cols = gridResolution; // Keep track of column count

  // Draw the grid markers and tiles
  drawGridAndTiles(margin, marginY, innerWidth, innerHeight);

  noLoop(); // Draw once
}

function drawGridAndTiles(startX, startY, totalWidth, totalHeight) {
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      // Calculate center of the current cell
      let cellCenterX = startX + (i + 0.5) * cellWidth;
      let cellCenterY = startY + (j + 0.5) * cellHeight;

      // --- 1. Draw Grid Marker ---
      strokeWeight(0.5);
      stroke(150); // Light grey for markers
      point(cellCenterX - 2, cellCenterY);
      point(cellCenterX + 2, cellCenterY);
      point(cellCenterX, cellCenterY - 2);
      point(cellCenterX, cellCenterY + 2);
      // Alternative '+' marker:
      // line(cellCenterX - 2, cellCenterY, cellCenterX + 2, cellCenterY);
      // line(cellCenterX, cellCenterY - 2, cellCenterX, cellCenterY + 2);

      // --- 2. Placement Decision ---
      let placementNoise = noise(i * placementNoiseScale, j * placementNoiseScale);

      if (placementNoise > placementThreshold) {
        // --- 3. Draw the Tile ---
        strokeWeight(1); // Thicker lines for the tile
        stroke(50);      // Darker stroke for tile lines
        drawDistortedTile(cellCenterX, cellCenterY, cellWidth, cellHeight);
      }
    }
  }
}

function drawDistortedTile(x, y, w, h) {
  // Calculate base corners relative to the center (x, y)
  let halfW = w / 2;
  let halfH = h / 2;

  let corners = [
    createVector(x - halfW, y - halfH), // Top-left (p1)
    createVector(x + halfW, y - halfH), // Top-right (p2)
    createVector(x + halfW, y + halfH), // Bottom-right (p3)
    createVector(x - halfW, y + halfH)  // Bottom-left (p4)
  ];

  // Distort corners using noise
  let distortedCorners = [];
  for (let i = 0; i < corners.length; i++) {
    let corner = corners[i];
    // Use corner's original position to sample noise, ensuring variation per tile/corner
    let noiseX = noise(corner.x * distortionNoiseScale, corner.y * distortionNoiseScale, 0);
    let noiseY = noise(corner.x * distortionNoiseScale, corner.y * distortionNoiseScale, 100); // Offset Z for different Y noise

    let offsetX = map(noiseX, 0, 1, -distortionMagnitude, distortionMagnitude);
    let offsetY = map(noiseY, 0, 1, -distortionMagnitude, distortionMagnitude);

    distortedCorners.push(createVector(corner.x + offsetX, corner.y + offsetY));
  }

  // --- 4. Draw Lines Inside ---
  // We'll draw lines between the top edge (p1-p2) and bottom edge (p4-p3)
  let p1 = distortedCorners[0];
  let p2 = distortedCorners[1];
  let p3 = distortedCorners[2];
  let p4 = distortedCorners[3];

  for (let i = 0; i <= linesPerTile; i++) {
    let t = i / linesPerTile; // Interpolation factor (0 to 1)

    // Point on top edge (p1 to p2)
    let topX = lerp(p1.x, p2.x, t);
    let topY = lerp(p1.y, p2.y, t);

    // Point on bottom edge (p4 to p3)
    let bottomX = lerp(p4.x, p3.x, t);
    let bottomY = lerp(p4.y, p3.y, t);

    line(topX, topY, bottomX, bottomY);
  }

   // Optional: Draw the distorted bounding box for debugging
   /*
   stroke(255, 0, 0, 100); // Red, semi-transparent
   strokeWeight(1);
   beginShape();
   for(let corner of distortedCorners) {
     vertex(corner.x, corner.y);
   }
   endShape(CLOSE);
   stroke(50); // Reset stroke
   strokeWeight(1);
   */

}

// No draw() function needed if using noLoop()
// function draw() {}