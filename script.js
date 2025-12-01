// Script for section switching and drones interactive comparison (with add and delete functionality, localStorage persistence)
document.addEventListener('DOMContentLoaded', () => {
  // Section switching
  const btnAbout = document.getElementById('btn-about');
  const btnDrones = document.getElementById('btn-drones');
  const btnCalendar = document.getElementById('btn-calendar');
  const sectionAbout = document.getElementById('section-about');
  const sectionDrones = document.getElementById('section-drones');
  const sectionCalendar = document.getElementById('section-calendar');

  btnAbout.addEventListener('click', () => {
    updateActiveButton(btnAbout);
    showSection(sectionAbout);
  });

  btnDrones.addEventListener('click', () => {
    updateActiveButton(btnDrones);
    showSection(sectionDrones);
    loadDrones(); // Load drones on section open
  });

  btnCalendar.addEventListener('click', () => {
    updateActiveButton(btnCalendar);
    showSection(sectionCalendar);
    renderCalendar(); // Render calendar on section open
  });

  function updateActiveButton(activeBtn) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  function showSection(activeSection) {
    document.querySelectorAll('.panel').forEach(sec => sec.classList.remove('visible'));
    activeSection.classList.add('visible');
  }

  // Drones functionality
  let dronesData = [];
  let sortAsc = true;

  async function loadDrones() {
    if (dronesData.length > 0) return;

    // Check localStorage first
    const storedDrones = localStorage.getItem('dronesData');
    if (storedDrones) {
      dronesData = JSON.parse(storedDrones);
    } else {
      const response = await fetch('drones.json');
      dronesData = await response.json();
      localStorage.setItem('dronesData', JSON.stringify(dronesData));
    }

    renderDrones(dronesData);
    renderTable(dronesData);
  }

  function renderDrones(data) {
    const list = document.getElementById('drones-list');
    list.innerHTML = '';
    data.forEach((drone, index) => {
      const card = document.createElement('div');
      card.className = 'drone-card';
      card.innerHTML = `
        <div class="model">${drone.model}</div>
        <div class="specs">Kamera: ${drone.camera}<br>Lentoaika: ${drone.flight}<br>Paino: ${drone.weight}<br>Hinta: ${drone.price} €<br>Arvosana: ${drone.rating}</div>
        <button class="delete-btn" data-index="${index}">Poista</button>
      `;
      list.appendChild(card);
    });
    addDeleteListeners();
  }

  function renderTable(data) {
    const tbody = document.querySelector('#drones-table tbody');
    tbody.innerHTML = '';
    data.forEach((drone, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${drone.model}</td>
        <td>${drone.camera}</td>
        <td>${drone.flight}</td>
        <td>${drone.weight}</td>
        <td>${drone.price}</td>
        <td>${drone.rating} <button class="delete-btn" data-index="${index}">Poista</button></td>
      `;
      tbody.appendChild(row);
    });
    addDeleteListeners();
  }

  function addDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        dronesData.splice(index, 1);
        localStorage.setItem('dronesData', JSON.stringify(dronesData));
        renderDrones(dronesData);
        renderTable(dronesData);
      });
    });
  }

  // Search
  document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = dronesData.filter(d => d.model.toLowerCase().includes(query));
    renderDrones(filtered);
    renderTable(filtered);
  });

  // Filter price
  document.getElementById('filter-price').addEventListener('change', (e) => {
    const value = e.target.value;
    let filtered = dronesData;
    if (value === 'budget') filtered = dronesData.filter(d => d.price < 500);
    else if (value === 'mid') filtered = dronesData.filter(d => d.price >= 500 && d.price <= 1500);
    else if (value === 'pro') filtered = dronesData.filter(d => d.price > 1500);
    renderDrones(filtered);
    renderTable(filtered);
  });

  // Sort price
  document.getElementById('sort-price').addEventListener('click', () => {
    const sorted = [...dronesData].sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price);
    sortAsc = !sortAsc;
    document.getElementById('sort-price').textContent = `Järjestä hinnan mukaan ${sortAsc ? '▲' : '▼'}`;
    renderDrones(sorted);
    renderTable(sorted);
  });

  // Add new drone
  document.getElementById('add-drone-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newDrone = {
      model: document.getElementById('new-model').value,
      camera: document.getElementById('new-camera').value,
      flight: document.getElementById('new-flight').value,
      weight: document.getElementById('new-weight').value,
      price: parseFloat(document.getElementById('new-price').value),
      rating: parseFloat(document.getElementById('new-rating').value)
    };
    dronesData.push(newDrone);
    localStorage.setItem('dronesData', JSON.stringify(dronesData));
    renderDrones(dronesData);
    renderTable(dronesData);
    e.target.reset(); // Clear form
  });

  // PDF save button functionality
  document.getElementById('save-pdf').addEventListener('click', () => {
    window.print(); // Opens print dialog, user can save as PDF
  });

  // Advent calendar functionality with SVG
  function renderCalendar() {
    const svg = document.getElementById('advent-calendar');
    if (svg.innerHTML !== '') return; // Render only once

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentDay = currentDate.getDate();

    let activeDay = 0;
    if (currentMonth === 12 && currentDay >= 1 && currentDay <= 24) {
      activeDay = currentDay;
    }

    const cols = 6;
    const rows = 4;
    const spacingX = 120;
    const spacingY = 120;
    const radius = 30;
    const positions = new Array(rows).fill(0).map(() => new Array(cols).fill(null)); // 2D array for positions

    // Draw branches in corners
    drawBranch(svg, 50, 50, 'top-left');
    drawBranch(svg, 750, 50, 'top-right');
    drawBranch(svg, 50, 550, 'bottom-left');
    drawBranch(svg, 750, 550, 'bottom-right');

    // Draw circles and collect positions
    for (let day = 1; day <= 24; day++) {
      const col = (day - 1) % cols;
      const row = Math.floor((day - 1) / cols);
      const x = 100 + col * spacingX;
      const y = 120 + row * spacingY; // Slightly lowered circles

      positions[row][col] = {x, y};

      const baseColor = getRandomColor();
      const isLit = day <= activeDay;
      const fillColor = isLit ? baseColor : darkenColor(baseColor, 0.3);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", fillColor);
      circle.setAttribute("stroke", "rgba(255,255,255,0.1)");
      circle.setAttribute("stroke-width", "2");
      if (isLit) {
        circle.classList.add("lit");
        circle.addEventListener('click', () => showChristmasImage(day));
        circle.style.cursor = 'pointer'; // Change cursor on hover for lit circles
      } else {
        circle.style.cursor = 'not-allowed'; // Disabled cursor for locked
      }
      svg.appendChild(circle);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x);
      text.setAttribute("y", y + 8); // Center text
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#fff");
      text.setAttribute("font-size", "20");
      text.textContent = day;
      svg.appendChild(text);
    }

    // Draw wavy lines between circles by rows, alternating direction
    for (let row = 0; row < rows; row++) {
      const isEvenRow = row % 2 === 0;
      const startCol = isEvenRow ? 0 : cols - 1;
      const endCol = isEvenRow ? cols - 1 : 0;
      const step = isEvenRow ? 1 : -1;

      for (let col = startCol; col !== endCol; col += step) {
        const start = positions[row][col];
        const end = positions[row][col + step];
        if (!start || !end) continue;

        // Calculate edge points (right/left based on direction)
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        const startEdgeX = start.x + radius * Math.cos(angle);
        const startEdgeY = start.y + radius * Math.sin(angle);
        const endEdgeX = end.x - radius * Math.cos(angle);
        const endEdgeY = end.y - radius * Math.sin(angle);

        // Smoother wavy path with smaller amplitude
        const midX1 = startEdgeX + (endEdgeX - startEdgeX) / 3;
        const midY1 = startEdgeY + (endEdgeY - startEdgeY) / 3 + 10 * Math.sin(row * Math.PI / 4); // Reduced wave offset
        const midX2 = startEdgeX + 2 * (endEdgeX - startEdgeX) / 3;
        const midY2 = startEdgeY + 2 * (endEdgeY - startEdgeY) / 3 - 10 * Math.sin(row * Math.PI / 4);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M${startEdgeX},${startEdgeY} Q${midX1},${midY1} ${midX2},${midY2} T${endEdgeX},${endEdgeY}`);
        path.setAttribute("stroke", "var(--garland-wire)");
        path.setAttribute("stroke-width", "2"); // Thicker wire
        path.setAttribute("fill", "none");
        path.setAttribute("opacity", "0.5");
        svg.insertBefore(path, svg.firstChild); // Draw lines behind circles
      }
    }

    // Connect rows at the ends
    for (let row = 0; row < rows - 1; row++) {
      const isEvenRow = row % 2 === 0;
      const connectCol = isEvenRow ? cols - 1 : 0; // Right for even, left for odd
      const start = positions[row][connectCol];
      const end = positions[row + 1][connectCol];

      // Straight vertical line between rows
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", start.x);
      line.setAttribute("y1", start.y + radius); // Bottom of start
      line.setAttribute("x2", end.x);
      line.setAttribute("y2", end.y - radius); // Top of end
      line.setAttribute("stroke", "var(--garland-wire)");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("opacity", "0.5");
      svg.insertBefore(line, svg.firstChild);
    }
  }

  // Function to get random color
  function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  }

  // Function to darken color
  function darkenColor(color, factor) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  }

  // Function to draw minimal branch with feathers on both sides (vector path)
  function drawBranch(svg, x, y, position) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0 0 L60 0 M10 0 L20 10 M10 0 L20 -10 M30 0 L40 10 M30 0 L40 -10 M50 0 L60 10 M50 0 L60 -10"); // Straight branch with symmetric feathers on both sides
    path.setAttribute("stroke", "var(--branch-color)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("transform", `translate(${x}, ${y}) rotate(${getRotation(position)})`);
    svg.appendChild(path);
  }

  function getRotation(position) {
    switch (position) {
      case 'top-left': return 45; // Slightly angled for better look
      case 'top-right': return 135;
      case 'bottom-left': return 315;
      case 'bottom-right': return 225;
      default: return 0;
    }
  }

  // Fixed unique Christmas images for each day
  const christmasImages = [
    'https://media.istockphoto.com/id/1352476311/vector/simple-christmas-background-golden-geometric-minimalist-elements-and-icons-happy-new-year.jpg?s=612x612&w=0&k=20&c=VTwvKs7QZmCuWNy6YuC3Wniijr_7NDK2agFkAZvNIPE=',
    'https://img.freepik.com/premium-vector/minimalist-christmas-illustrations-xmas-festive-holidays-event-vector-eps_351449-2243.jpg',
    'https://img.freepik.com/premium-vector/minimalist-christmas-background-vector_619130-1251.jpg',
    'https://media.istockphoto.com/id/1749247794/vector/set-of-minimalistic-geometric-christmas-elements-in-flat-and-linear-style-abstract-xmas.jpg?s=612x612&w=0&k=20&c=7W8qZuIQZRI5pPLE8kcUXeH2EAQnR8Z15RzaJ6uyG5Q=',
    'https://static.vecteezy.com/system/resources/previews/000/138/874/non_2x/minimalist-christmas-elements-vector.png',
    'https://www.creativefabrica.com/wp-content/uploads/2023/10/05/Christmas-Tree-Abstract-Minimalist-SVG-Graphics-80856033-2-580x403.png',
    'https://cdn.vectorstock.com/i/1000v/22/93/christmas-trees-in-modern-minimalist-geometric-vector-48872293.jpg',
    'https://media.istockphoto.com/id/1178774999/vector/christmas-tree-set-isolated-on-white-background-vector-illustration-icon.jpg?s=612x612&w=0&k=20&c=-hyg8vZozxcsqwy4T0COXHua-zLns18NE3vUqa-ff_M=',
    'https://i.etsystatic.com/13143921/r/il/1619cf/4376049460/il_fullxfull.4376049460_p5zo.jpg',
    'https://www.shutterstock.com/image-vector/minimalist-christmas-trees-soft-pastel-260nw-2544904827.jpg',
    'https://img.freepik.com/premium-vector/minimalist-christmas-tree-vector-illustration-set-festive-holiday-design_1169858-276.jpg',
    'https://cdn.vectorstock.com/i/1000v/82/05/minimalist-christmas-trees-card-vector-28038205.jpg',
    'https://media.gettyimages.com/id/1187155353/vector/holiday-card-with-christmas-trees.jpg?s=612x612&w=gi&k=20&c=x7uAjBmJKf15QG5oFTcbGLVqEqp5wsra73Tr6sOqlE8=',
    'https://www.shutterstock.com/image-vector/set-abstract-minimalist-christmas-trees-260nw-2388381961.jpg',
    'https://www.creativefabrica.com/wp-content/uploads/2022/12/14/Minimalist-Christmas-trees-clip-art-svg-Graphics-52256794-1-1-580x387.jpg',
    'https://i.etsystatic.com/6063454/r/il/a1f776/6325763725/il_570xN.6325763725_1uxd.jpg',
    'https://media.gettyimages.com/id/1714592536/vector/big-new-year-and-christmas-set-editable-stroke-elegant-gold-line-art-design-elements-outline.jpg?s=612x612&w=gi&k=20&c=48tn105WRPk3fZ9nmViv8O2-tDSPnWrIIiTyq4ljXTw=',
    'https://static.vecteezy.com/system/resources/thumbnails/000/267/411/small/scandinavian_style_christmas_background_2009.jpg',
    'https://image.shutterstock.com/image-vector/simple-christmas-happy-new-year-260nw-2232597115.jpg',
    'https://i.etsystatic.com/13498447/r/il/f7c7c0/3510331606/il_fullxfull.3510331606_ijgs.jpg',
    'https://img.freepik.com/free-vector/hand-drawn-christmas-tree-ornaments-design-set_1017-40096.jpg?semt=ais_hybrid&w=740&q=80',
    'https://media.gettyimages.com/id/2169427967/vector/simple-christmas-holiday-design-elements.jpg?s=612x612&w=gi&k=20&c=a4zBYZiO6Ef_lGLlkAZphNmyvoA_MAQw8BcICSW6qZQ=',
    'https://static.vecteezy.com/system/resources/previews/053/384/902/non_2x/minimalist-christmas-background-with-bokeh-3d-render-free-vector.jpg',
    'https://www.shutterstock.com/image-vector/merry-christmas-happy-new-year-260nw-1163528611.jpg'
  ];

  function showChristmasImage(day) {
    const imageUrl = christmasImages[day - 1]; // Fixed image for each day
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <span class="close-modal">&times;</span>
      <img src="${imageUrl}" alt="Joulukuva päivä ${day}">
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // Add styles for modal in code (since no separate CSS file)
  const style = document.createElement('style');
  style.textContent = `
    .image-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .image-modal img {
      max-width: 80%;
      max-height: 80%;
    }
    .close-modal {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 2rem;
      color: #fff;
      cursor: pointer;
    }
    .lit {
      animation: glow 1.5s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from {
        filter: brightness(1);
      }
      to {
        filter: brightness(1.5);
      }
    }
  `;
  document.head.appendChild(style);

  // Render hanging ornaments under header
  function renderOrnaments() {
    const svg = document.querySelector('.ornaments-svg');
    if (!svg) return;

    const numOrnaments = 5;
    const width = 1000;
    const height = 100;
    const ornamentRadius = 15;

    for (let i = 1; i <= numOrnaments; i++) {
      const x = (width / (numOrnaments + 1)) * i;
      const lineLength = 40 + Math.random() * 20; // Random hang length

      // Hanging line
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", x);
      line.setAttribute("y2", lineLength);
      line.setAttribute("stroke", "var(--garland-wire)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);

      // Ornament ball
      const color = getRandomColorFromList();
      const ball = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ball.setAttribute("cx", x);
      ball.setAttribute("cy", lineLength + ornamentRadius);
      ball.setAttribute("r", ornamentRadius);
      ball.setAttribute("fill", color);
      ball.setAttribute("stroke", "#ffd700");
      ball.setAttribute("stroke-width", "1");
      svg.appendChild(ball);
    }
  }

  function getRandomColorFromList() {
    const rootStyle = getComputedStyle(document.documentElement);
    const colors = rootStyle.getPropertyValue('--ornament-colors').trim().split(', ');
    return colors[Math.floor(Math.random() * colors.length)];
  }

  renderOrnaments(); // Render ornaments on load
});