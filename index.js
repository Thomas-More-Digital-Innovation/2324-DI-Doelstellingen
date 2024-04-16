const states = {
  "n": { label: "Geen filter" },
  "td": { label: "To Do" },
  "ip": { label: "In Progress", color: "odd:bg-[#ffc240]/30 even:bg-[#ffc240]/40 hover:bg-[#ffc240]/50 text-black" },
  "d": { label: "Done", color: "odd:bg-[#40ff80]/30 even:bg-[#40ff80]/40 hover:bg-[#40ff80]/50 text-black" },
};

const statesSelect = document.getElementById("states");
const richtingenSelect = document.getElementById("richtingen");
const search = document.getElementById("search");
const tableBody = document.getElementById("tableBody");
const model = document.getElementById("model");
const modelText = document.getElementById("modelText");
const counters = document.getElementById("counters");

window.onload = () => { generate(); };

window.onkeyup = (e) => { if (e.key == "Escape") closeModel() };

search.oninput = checkFilters;
richtingenSelect.onchange = checkFilters;
statesSelect.onchange = checkFilters;

function checkFilters() {
  for (const tr of tableBody.children) {
    let display = true;
    if (tr.children[0].tagName == "TH") continue;
    for (const td of tr.children) {
      if (!td.innerText.toLowerCase().includes(search.value.toLowerCase())) {
        display = false;
      } else { display = true; break; }
    }
    const richtingenSelectValue = richtingenSelect.value;
    const statesSelectValue = statesSelect.value;
    if (richtingenSelectValue != "ALLES") {
      const types = tr.children[1].innerText.split(", ");
      if (!types.includes(richtingenSelectValue) && !types.includes('ALLES')) display = false;
    };
    if (statesSelectValue != "n") {
      if (!tr.children[2].innerText.includes(states[statesSelectValue]["label"])) {
        display = false;
      }
    };
    display ? tr.style.display = "" : tr.style.display = "none";
  }
}

function generate() {
  statesSelect.innerHTML = "";
  richtingenSelect.innerHTML = "";
  tableBody.innerHTML = "";
  let countTodo = 0;
  let countDone = 0;
  let countInProgress = 0;
  for (const [k, v] of Object.entries(states)) { k == "n" ? statesSelect.innerHTML += `<option value="${k}" selected>${v["label"]}</option>` : statesSelect.innerHTML += `<option value="${k}">${v["label"]}</option>`; }
  let r = [];
  for (const [a, b] of Object.entries(doelstellingen)) {
    tableBody.innerHTML += `
    <tr>
      <th class="bg-gray-200 text-left px-6 py-4" colspan="6">${a}</th>
    </tr>
    `;
    for (const [c, d] of Object.entries(b)) {
      let types = "";
      let status = "";
      let color = "";
      if (states[d["status"]]) {
        status = states[d["status"]]["label"];
        if (d["status"] == "d") countDone++;
        if (d["status"] == "ip") countInProgress++;
        if (d["status"] == "td") countTodo++;
        color = states[d["status"]]["color"] || "odd:bg-white even:bg-gray-50 hover:bg-gray-100";
      };
      for (const [e, f] of Object.entries(d["type"])) {
        if (!r.includes(f.toUpperCase())) r = [...r, f.toUpperCase()];
        types += f.toUpperCase();
        if (d["type"].length != d["type"].indexOf(f) + 1) types += ", ";
      }
      tableBody.innerHTML += `
      <tr class="border-b text-center ${color}">
        <td class="px-6 py-4 text-left">${c}</td>
        <td class="px-6 py-4">${types.trimEnd()}</td>
        <td class="px-6 py-4">${status}</td>
        <td class="px-6 py-4">${d["verified"] || ""}</td>
        <td class="px-6 py-4">${d["project"] || ""}</td>
        <td class="px-6 py-4">${d["bewijs"] ? `<button onclick="openModel(\`${d["bewijs"]}\`)" class="hover:filter hover:brightness-50"><svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/></svg></button>` : ""}</td>
      </tr>
      `;
    }
  }
  r.sort();  
  const data = {
    labels: [
      'Todo',
      'Done',
      'In Progress'
    ],
    datasets: [{
      label: 'Aantal',
      data: [countTodo, countDone, countInProgress],
      backgroundColor: [
        '#e5e7eb',
        '#40ff80',
        '#ffc240'
      ],
      hoverOffset: 4
    }]
  };
  const config = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: false,
      borderColor: "#000",
      borderWidth: 1,
      plugins: {
        legend: {
          position: 'right',
        },
        datalabels: {
          color: 'black'
        },
        title: {
          display: true,
          text: `Doelstellingen Status (${Math.round((((countDone/countTodo)*100) + Number.EPSILON) * 100) / 100}%)`,
        }
      },
      layout: {
        padding: 0
      }, 
    }
  };
  const ctx = document.getElementById('chart');
  Chart.register(ChartDataLabels);
  new Chart(ctx, config);
  for (const v of r) { v == "ALLES" ? richtingenSelect.innerHTML += `<option value="${v}" selected>${v}</option>` : richtingenSelect.innerHTML += `<option value="${v}">${v}</option>`; }
}

function openModel(data) {
  model.classList.remove("hidden");
  model.classList.add("flex");
  modelText.innerHTML = data;
}

function closeModel() {
  model.classList.add("hidden");
  model.classList.remove("flex");
  modelText.innerHTML = "";
}