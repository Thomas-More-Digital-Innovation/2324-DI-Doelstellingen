const states = {
  "n": { label: "No filter" },
  "td": { label: "To Do" },
  "ip": { label: "In Progress", color: "odd:bg-[#ffc240]/30 even:bg-[#ffc240]/40 hover:bg-[#ffc240]/50 text-black" },
  "d": { label: "Done", color: "odd:bg-[#40ff80]/30 even:bg-[#40ff80]/40 hover:bg-[#40ff80]/50 text-black" },
};

const statesSelect = document.getElementById("states");
const tracksSelect = document.getElementById("tracks");
const search = document.getElementById("search");
const tableBody = document.getElementById("tableBody");
const model = document.getElementById("model");
const modelTitle = document.getElementById("modelTitle");
const modelText = document.getElementById("modelText");

window.onload = () => { generate(); };

window.onkeyup = (e) => { if (e.key == "Escape") closeModel() };
model.onclick = (e) => { if (e.target == model) closeModel() };

search.oninput = checkFilters;
tracksSelect.onchange = checkFilters;
statesSelect.onchange = checkFilters;

function checkFilters() {
  // First pass: check if items pass the filter (don't apply accordion state yet)
  for (const tr of tableBody.children) {
    if (tr.children[0].tagName == "TH") continue;
    
    let passesFilter = true;
    for (const td of tr.children) {
      if (!td.innerText.toLowerCase().includes(search.value.toLowerCase())) {
        passesFilter = false;
      } else { passesFilter = true; break; }
    }
    const tracksSelectValue = tracksSelect.value;
    const statesSelectValue = statesSelect.value;
    if (tracksSelectValue != "ALLES") {
      const types = tr.children[1].innerText.split(", ");
      if (!types.includes(tracksSelectValue) && !types.includes('ALLES')) passesFilter = false;
    };
    if (statesSelectValue != "n") {
      if (!tr.children[2].innerText.includes(states[statesSelectValue]["label"])) {
        passesFilter = false;
      }
    };
    
    // Store filter result as data attribute
    tr.dataset.passesFilter = passesFilter;
  }
  
  // Second pass: hide category headers if all items are filtered out
  let currentHeader = null;
  let hasFilteredItems = false;
  
  for (const tr of tableBody.children) {
    if (tr.children[0].tagName == "TH") {
      // If we have a previous header, update its visibility
      if (currentHeader) {
        currentHeader.style.display = hasFilteredItems ? "" : "none";
      }
      // Start tracking new category
      currentHeader = tr;
      hasFilteredItems = false;
    } else {
      // Check if this row passes the filter (ignore accordion state)
      if (tr.dataset.passesFilter === "true") {
        hasFilteredItems = true;
      }
    }
  }
  
  // Handle the last category
  if (currentHeader) {
    currentHeader.style.display = hasFilteredItems ? "" : "none";
  }
  
  // Third pass: apply display based on both filter and accordion state
  for (const tr of tableBody.children) {
    if (tr.children[0].tagName == "TH") continue;
    
    const passesFilter = tr.dataset.passesFilter === "true";
    const isCollapsed = tr.classList.contains('accordion-collapsed');
    
    // Show only if it passes filter AND is not collapsed by accordion
    tr.style.display = (passesFilter && !isCollapsed) ? "" : "none";
  }
}

function generate() {
  statesSelect.innerHTML = "";
  tracksSelect.innerHTML = "";
  tableBody.innerHTML = "";
  let countTodo = 0;
  let countDone = 0;
  let countInProgress = 0;
  let countVerified = 0;
  for (const [k, v] of Object.entries(states)) { k == "n" ? statesSelect.innerHTML += `<option value="${k}" selected>${v["label"]}</option>` : statesSelect.innerHTML += `<option value="${k}">${v["label"]}</option>`; }
  let r = [];
  for (const [a, b] of Object.entries(learningGoals)) {
    const categoryId = a.replace(/\s+/g, '-');
    tableBody.innerHTML += `
    <tr class="category-header cursor-pointer hover:bg-gray-300" data-category="${categoryId}">
      <th class="bg-gray-200 text-left px-6 py-4 select-none" colspan="6">
        <span class="inline-flex items-center">
          <svg class="w-4 h-4 mr-2 transition-transform category-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          ${a}
        </span>
      </th>
    </tr>
    `;
    for (const [c, d] of Object.entries(b)) {
      let types = "";
      let status = "";
      let color = "";
      if (states[d["status"]]) {
        status = states[d["status"]]["label"];
        if (d["status"] == "d" && d["verified"] == "") countDone++;
        if (d["status"] == "ip") countInProgress++;
        if (d["status"] == "td") countTodo++;
        if (d["verified"] != "" && d["status"] != "ip") countVerified++;
        color = states[d["status"]]["color"] || "odd:bg-white even:bg-gray-50 hover:bg-gray-100";
        if (d["status"] == "d" && d["verified"] != "") {color = "odd:bg-[#94b3ed]/30 even:bg-[#94b3ed]/40 hover:bg-[#94b3ed]/50 text-black"}
      };
      for (const [e, f] of Object.entries(d["type"])) {
        if (!r.includes(f.toUpperCase())) r = [...r, f.toUpperCase()];
        types += f.toUpperCase();
        if (d["type"].length != d["type"].indexOf(f) + 1) types += ", ";
      }
      tableBody.innerHTML += `
      <tr class="border-b text-center category-item ${color}" data-category="${categoryId}">
        <td class="px-6 py-4 text-left">${c}</td>
        <td class="px-6 py-4">${types.trimEnd()}</td>
        <td class="px-6 py-4">${status}</td>
        <td class="px-6 py-4">${d["verified"] || ""}</td>
        <td class="px-6 py-4">${d["project"] || ""}</td>
        <td class="px-6 py-4">${d["evidence"] ? `<button onclick="openModel(${c.split(" ")[0]}, \`${d["evidence"]}\`)" class="hover:filter hover:brightness-50"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/></svg></button>` : ""}</td>
      </tr>
      `;
    }
  }
  r.sort();
  const total = countDone + countInProgress + countTodo + countVerified;
  const done = countDone + countVerified;
  const data = {
    labels: [
      'Todo',
      'Done',
      'In Progress',
      'Verified'
    ],
    datasets: [{
      label: 'Count',
      data: [countTodo, countDone, countInProgress, countVerified],
      backgroundColor: [
        '#d1d5db',
        '#10b981',
        '#FA6432',
        '#7FC1E0FF'
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
      hoverBorderColor: '#ffffff',
      hoverBorderWidth: 4
    }]
  };
  const config = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              size: 13,
              family: "'Inter', 'system-ui', 'sans-serif'",
              weight: '500'
            },
            color: '#00293F',
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        },
        title: {
          display: true,
          text: [
            `Done: ${calc(done, total)}% | Verified: ${calc(countVerified, total)}%`
          ],
          font: {
            size: 14,
            family: "'Inter', 'system-ui', 'sans-serif'",
            weight: 'bold'
          },
          color: '#00293F',
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: '#00293F',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          borderColor: '#FA6432',
          borderWidth: 2
        }
      },
      layout: {
        padding: 10
      },
    }
  };
  const ctx = document.getElementById('chart');
  Chart.register(ChartDataLabels);
  new Chart(ctx, config);
  for (const v of r) { v == "ALLES" ? tracksSelect.innerHTML += `<option value="${v}" selected>${v}</option>` : tracksSelect.innerHTML += `<option value="${v}">${v}</option>`; }
  
  // Add accordion functionality
  setupAccordion();
  checkFilters();
}

function setupAccordion() {
  const headers = document.querySelectorAll('.category-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const categoryId = header.dataset.category;
      const items = document.querySelectorAll(`.category-item[data-category="${categoryId}"]`);
      const icon = header.querySelector('.category-icon');
      
      items.forEach(item => {
        if (item.classList.contains('accordion-collapsed')) {
          item.classList.remove('accordion-collapsed');
        } else {
          item.classList.add('accordion-collapsed');
        }
      });
      
      // Rotate icon
      icon.classList.toggle('rotate-180');
      
      // After toggling, recheck filters to update visibility
      checkFilters();
    });
  });
}

function calc(type, max) {
  return Math.round((((type / max) * 100) + Number.EPSILON) * 100) / 100;
}

function openModel(number, data) {
  model.classList.remove("hidden");
  model.classList.add("flex");
  modelTitle.innerHTML = `Evidence ${number}`;
  modelText.innerHTML = data;
  checkAccordions();
}

function closeModel() {
  model.classList.add("hidden");
  model.classList.remove("flex");
  modelTitle.innerHTML = "";
  modelText.innerHTML = "";
}

function checkAccordions() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.header');
    header.addEventListener('click', () => {
      const toggle = item.querySelector('.toggle');
      const circle = item.querySelector('.circle');
      const line = item.querySelector('.line');

      circle.classList.toggle("border-blue-600");
      header.classList.toggle("bg-blue-100");
      header.classList.toggle("text-blue-600");
      toggle.classList.toggle("hidden");
      line.classList.toggle("hidden");
    });
  });
}
