// Script for section switching and drones interactive comparison (with add and delete functionality, localStorage persistence)
document.addEventListener('DOMContentLoaded', () => {
  // Section switching
  const btnAbout = document.getElementById('btn-about');
  const btnDrones = document.getElementById('btn-drones');
  const sectionAbout = document.getElementById('section-about');
  const sectionDrones = document.getElementById('section-drones');

  btnAbout.addEventListener('click', () => {
    btnAbout.classList.add('active');
    btnDrones.classList.remove('active');
    sectionAbout.classList.add('visible');
    sectionDrones.classList.remove('visible');
  });

  btnDrones.addEventListener('click', () => {
    btnDrones.classList.add('active');
    btnAbout.classList.remove('active');
    sectionDrones.classList.add('visible');
    sectionAbout.classList.remove('visible');
    loadDrones(); // Load drones on section open
  });

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
});