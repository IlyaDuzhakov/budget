// script.js (финальная версия с графиками и валютами)
document.addEventListener("DOMContentLoaded", () => {
  
  const resultDiv = document.createElement("div");
  resultDiv.id = "month-result";
  resultDiv.style.margin = "20px auto";
  resultDiv.style.textAlign = "center";
  resultDiv.style.fontSize = "18px";
  resultDiv.style.maxWidth = "600px";
  document.querySelector(".container").appendChild(resultDiv);
  const form = document.getElementById("transaction-form");
  const amountInput = document.getElementById("amount");
  const type = document.querySelector('input[name="type"]:checked').value;
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");
  const commentInput = document.getElementById("comment");
  const currencyInput = document.getElementById("currency");
  const rateInput = document.getElementById("rate");
  const currencyBtn = document.getElementById("toggle-currency-table");
  const currencyTableDiv = document.getElementById("currency-table");
  const currencyFlag = document.getElementById("currency-flag");

  const tableBody = document.querySelector("#transaction-table tbody");
  const saveCsvBtn = document.getElementById("save-csv");
  const printBtn = document.getElementById("print-report");
  const doughnutCtx = document.getElementById("doughnutChart").getContext("2d");
  // const lineCtx = document.getElementById("lineChart").getContext("2d");

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let doughnutChart, lineChart;

  const currencyList = [
    { code: "USD", flag: "🇺🇸", name: "Доллар США" },
    { code: "EUR", flag: "🇪🇺", name: "Евро" },
    { code: "GBP", flag: "🇬🇧", name: "Фунт стерлингов" },
    { code: "CAD", flag: "🇨🇦", name: "Канадский доллар" },
    { code: "AUD", flag: "🇦🇺", name: "Австралийский доллар" },
    { code: "JPY", flag: "🇯🇵", name: "Японская иена" },
    { code: "CNY", flag: "🇨🇳", name: "Китайский юань" },
    { code: "GEL", flag: "🇬🇪", name: "Грузинский лари" },
    { code: "RSD", flag: "🇷🇸", name: "Сербский динар" },
    { code: "KZT", flag: "🇰🇿", name: "Казахстанский тенге" },
    { code: "ILS", flag: "🇮🇱", name: "Израильский шекель" },
    { code: "AZN", flag: "🇦🇿", name: "Азербайджанский манат" },
    { code: "BGN", flag: "🇧🇬", name: "Болгарский лев" },
    { code: "SGD", flag: "🇸🇬", name: "Сингапурский доллар" },
    { code: "OMR", flag: "🇴🇲", name: "Оманский риал" },
    { code: "KWD", flag: "🇰🇼", name: "Кувейтский динар" },
    { code: "BHD", flag: "🇧🇭", name: "Бахрейнский динар" }
  ];

  document.querySelectorAll(".quick-currency").forEach(btn => {
  btn.addEventListener("click", () => {
    const code = btn.dataset.code;
    const currencyObj = currencyList.find(c => c.code === code);
    fetch("https://open.er-api.com/v6/latest/RUB")
      .then(res => res.json())
      .then(data => {
        const rate = data.rates[code] ? (1 / data.rates[code]).toFixed(2) : "";
        currencyInput.value = code;
        rateInput.value = rate;
        currencyFlag.textContent = currencyObj.flag || "🏳️";
      })
      .catch(() => alert("Не удалось загрузить курс валют."));
  });
});


  function updateCurrencyTable() {
    fetch("https://open.er-api.com/v6/latest/RUB")
      .then(res => res.json())
      .then(data => {
        if (!data.rates) throw new Error("Нет данных");
        let html = '<table><tr><th>Флаг</th><th>Код</th><th>Курс</th></tr>';
        currencyList.forEach(cur => {
          const rate = data.rates[cur.code] ? (1 / data.rates[cur.code]).toFixed(2) : "-";
          html += `<tr data-code="${cur.code}" title="${cur.name}" style="cursor:pointer">` +
            `<td class="flag">${cur.flag}</td><td>${cur.code}</td><td>${rate}</td></tr>`;
        });
        html += "</table>";
        currencyTableDiv.innerHTML = html;
      })
      .catch(() => {
        currencyTableDiv.innerHTML = "<p>Ошибка загрузки валют</p>";
      });
  }

  currencyBtn.addEventListener("click", () => {
    currencyTableDiv.style.display = currencyTableDiv.style.display === "none" ? "block" : "none";
    if (currencyTableDiv.style.display === "block") updateCurrencyTable();
  });

  currencyTableDiv.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-code]");
    if (!row) return;
    const code = row.dataset.code;
    const rateCell = row.querySelector("td:last-child");
    const flagCell = row.querySelector("td.flag");
    currencyInput.value = code;
    rateInput.value = rateCell ? rateCell.textContent : "";
    currencyFlag.textContent = flagCell ? flagCell.textContent : "🏳️";
    currencyTableDiv.style.display = "none";
  });

  function getCategoryIcon(type, category) {
    category = category.toLowerCase();
    if (type === 'expense') {
      if (category.includes('апт')) return '💊';
      if (category.includes('продукт') || category.includes('еда')) return '🛒';
      if (category.includes('транспорт') || category.includes('метро') || category.includes('автобус')) return '🚌';
      if (category.includes('кафе') || category.includes('ресторан')) return '☕';
      if (category.includes('одежда') || category.includes('обувь')) return '👕';
      if (category.includes('жиль') || category.includes('квартира') || category.includes('дом')) return '🏠';
      if (category.includes('связь') || category.includes('телефон')) return '📱';
      if (category.includes('интернет')) return '🌐';
      if (category.includes('развл') || category.includes('кино') || category.includes('игр')) return '🎮';
      if (category.includes('учеб') || category.includes('школ') || category.includes('курс')) return '🎓';
      if (category.includes('дет')) return '🧒';
      if (category.includes('животн') || category.includes('кот') || category.includes('собак')) return '🐾';
      if (category.includes('подар')) return '🎁';
      if (category.includes('страх')) return '🛡️';
      return '❓';
    } else {
      if (category.includes('аренда') || category.includes('машин') || category.includes('авто')) return '🚗';
      if (category.slice(-1) === 'а') return '👩';
      return '👨';
    }
  }

  function renderTable() {
  tableBody.innerHTML = "";
  transactions.forEach((tx, index) => {
    const row = document.createElement("tr");
    row.className = tx.type;
    row.setAttribute("data-index", index);

    row.innerHTML = `
      <td>${tx.date || ''}</td>
      <td>${tx.type === 'income' ? 'Доход' : 'Расход'}</td>
      <td>${tx.amount ? tx.amount.toFixed(2) : '0.00'}</td>
      <td>${getCategoryIcon(tx.type, tx.category)} ${tx.category || ''}</td>
      <td style="white-space: pre-wrap; font-size: 13px; line-height: 1.2; word-break: break-word; max-width: 200px; overflow-wrap: break-word;">
        ${tx.comment || ''}
      </td>
      <td class="delete-cell"><span class="delete-btn" title="Удалить">❌</span></td>
    `;
row.querySelector(".delete-btn").addEventListener("click", (e) => {
  e.stopPropagation(); // Чтобы не срабатывал основной клик по строке
  const idx = parseInt(row.getAttribute("data-index"));
  transactions.splice(idx, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTable();
  renderDoughnutChart();
  renderBarChart();
  renderMonthResult(); // ✅ именно здесь
});

    row.addEventListener("click", () => {
  const idx = parseInt(row.getAttribute("data-index"));
  const tx = transactions[idx];

  // Перемещаем транзакцию в начало списка
  transactions.splice(idx, 1);
  transactions.unshift(tx);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Заполняем поля формы
  amountInput.value = tx.amount;
  categoryInput.value = tx.category;
  dateInput.value = tx.date;
  commentInput.value = tx.comment;
  document.querySelector(`input[name="type"][value="${tx.type}"]`).checked = true;

  renderTable();
  renderDoughnutChart();
  renderBarChart();
  renderMonthResult(); // ✅ именно здесь
// });

//     });

//     tableBody.appendChild(row);
//   });
// }


  
function renderBarChart() {
  const ctx = document.getElementById("barChart").getContext("2d");

  // Группируем категории расходов
  const categoryTotals = {};

  transactions.forEach(t => {
    if (t.type === 'expense') {
      const cat = t.category || 'Без категории';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (window.barChartInstance) window.barChartInstance.destroy(); // очищаем, если был
  window.barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Расходы по категориям",
        data: data,
        backgroundColor: "#ff7043"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Расходы по категориям' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}



  



  calcBtn.addEventListener("click", () => {
    calcBox.style.display = calcBox.style.display === "none" ? "block" : "none";
  });

  calcBox.addEventListener("click", e => {
    if (!e.target.classList.contains("calc-btn")) return;
    const input = document.getElementById("calc-input");
    const value = e.target.textContent;
    if (value === '=') {
      try {
        input.value = eval(input.value);
      } catch {
        input.value = 'Ошибка';
      }
    } else {
      input.value += value;
    }
  });
    renderMonthResult();

  // // Калькулятор
  // const calcBtn = document.createElement("button");
  // calcBtn.textContent = "🧮 Калькулятор";
  // calcBtn.style.margin = "10px";
  // calcBtn.style.padding = "8px 16px";
  // calcBtn.style.borderRadius = "20px";
  // calcBtn.style.border = "none";
  // calcBtn.style.background = "linear-gradient(135deg, #ffa726, #fb8c00)";
  // calcBtn.style.color = "white";
  // calcBtn.style.cursor = "pointer";

  // const calcBox = document.createElement("div");
  // calcBox.style.display = "none";
  // calcBox.style.margin = "10px auto";
  // calcBox.style.maxWidth = "300px";
  // calcBox.style.padding = "20px";
  // calcBox.style.border = "1px solid #ccc";
  // calcBox.style.borderRadius = "12px";
  // calcBox.style.background = "#fff";

  // calcBox.innerHTML = `
  //   <input id="calc-input" type="text" style="width: 100%; padding: 10px; font-size: 1.2em; margin-bottom: 10px;" />
  //   <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
  //     ${[7,8,9,'/',4,5,6,'*',1,2,3,'-','0','.','=','+'].map(c => `<button class="calc-btn">${c}</button>`).join('')}
  //   </div>
  // `;

  // document.querySelector(".container").appendChild(calcBtn);
  // document.querySelector(".container").appendChild(calcBox);

  calcBtn.addEventListener("click", () => {
    calcBox.style.display = calcBox.style.display === "none" ? "block" : "none";
  });

  calcBox.addEventListener("click", e => {
    if (!e.target.classList.contains("calc-btn")) return;
    const input = document.getElementById("calc-input");
    const value = e.target.textContent;
    if (value === '=') {
      try {
        input.value = eval(input.value);
      } catch {
        input.value = 'Ошибка';
      }
    } else {
      input.value += value;
    }
  });
      });
      tableBody.appendChild(row);
    });
  }

  function renderDoughnutChart() {
    if (doughnutChart) doughnutChart.destroy();
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    doughnutChart = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Доходы', 'Расходы'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['#4caf50', '#f44336']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Соотношение доходов и расходов' }
        }
      }
    });
  }

function renderBarChart() {
  const ctx = document.getElementById("barChart").getContext("2d");

  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const cat = t.category || 'Без категории';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // Фиксированные цвета для некоторых категорий
  const categoryColors = {
    "аптека": "#e57373",       // красный
    "продукты": "#81c784",     // зелёный
    "транспорт": "#64b5f6",    // синий
    "кафе": "#ffb74d",         // оранжевый
    "одежда": "#ba68c8",       // фиолетовый
    "жилье": "#4db6ac",        // бирюзовый
    "интернет": "#7986cb",     // голубовато-синий
    "развлечения": "#f06292",  // розовый
    "учеба": "#9575cd",        // сиреневый
    "подарки": "#fbc02d",      // жёлтый
  };

  const backgroundColors = labels.map(cat => {
    const lower = cat.toLowerCase();
    for (let key in categoryColors) {
      if (lower.includes(key)) {
        return categoryColors[key];
      }
    }
    // случайный цвет для неизвестных категорий
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  });

  if (window.barChartInstance) window.barChartInstance.destroy();

  window.barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Расходы по категориям",
        data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Расходы по категориям' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}




  // function renderLineChart() {
  //   if (lineChart) lineChart.destroy();
  //   const dailyIncome = {}, dailyExpense = {};
  //   transactions.forEach(t => {
  //     if (!dailyIncome[t.date]) dailyIncome[t.date] = 0;
  //     if (!dailyExpense[t.date]) dailyExpense[t.date] = 0;
  //     if (t.type === 'income') dailyIncome[t.date] += t.amount;
  //     if (t.type === 'expense') dailyExpense[t.date] += t.amount;
  //   });
  //   const labels = [...new Set(transactions.map(t => t.date))].sort();
  //   const incomeData = labels.map(d => dailyIncome[d] || 0);
  //   const expenseData = labels.map(d => dailyExpense[d] || 0);

  //   lineChart = new Chart(lineCtx, {
  //     type: 'line',
  //     data: {
  //       labels: labels,
  //       datasets: [
  //         {
  //           label: 'Доходы',
  //           data: incomeData,
  //           borderColor: 'green',
  //           backgroundColor: 'rgba(76, 175, 80, 0.2)',
  //           fill: true,
  //           tension: 0.3
  //         },
  //         {
  //           label: 'Расходы',
  //           data: expenseData,
  //           borderColor: 'red',
  //           backgroundColor: 'rgba(244, 67, 54, 0.2)',
  //           fill: true,
  //           tension: 0.3
  //         }
  //       ]
  //     },
  //     options: {
  //       responsive: true,
  //       plugins: {
  //         legend: { position: 'top' },
  //         title: { display: true, text: 'Доходы и расходы по дням' }
  //       },
  //       scales: { y: { beginAtZero: true } }
  //     }
  //   });
  // }

  form.addEventListener("submit", e => {
  e.preventDefault();
  let amount = parseFloat(amountInput.value);
  const type = document.querySelector('input[name="type"]:checked').value; // ✅
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const comment = commentInput.value.trim();
    const currency = currencyInput.value;
    const rate = parseFloat(rateInput.value);
    if (currency !== 'RUB' && !isNaN(rate)) {
      amount *= rate;
    }
    const tx = { amount, type, category, date, comment };
    transactions.push(tx);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTable();
    renderDoughnutChart();
    renderBarChart();
    renderMonthResult();
    // renderDoughnutChart();
    // renderLineChart();
    form.reset();
  });

  saveCsvBtn.addEventListener("click", () => {
    const rows = [["Дата", "Тип", "Сумма", "Категория", "Комментарий"]];
    transactions.forEach(t => {
      rows.push([
        t.date || '',
        t.type === 'income' ? 'Доход' : 'Расход',
        t.amount ? t.amount.toFixed(2) : '0.00',
        t.category || '',
        t.comment || ''
      ]);
    });
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  });

  printBtn.addEventListener("click", () => window.print());

  document.getElementById("save-clear-month").addEventListener("click", () => {
  if (transactions.length === 0) {
    alert("Нет данных для сохранения.");
    return;
  }

  const now = new Date();
  const month = now.getMonth() + 1; // от 0 до 11
  const year = now.getFullYear();
  const fileName = `transactions_${year}-${month.toString().padStart(2, '0')}.csv`;

  const rows = [["Дата", "Тип", "Сумма", "Категория", "Комментарий"]];
  transactions.forEach(t => {
    rows.push([
      t.date || '',
      t.type === 'income' ? 'Доход' : 'Расход',
      t.amount ? t.amount.toFixed(2) : '0.00',
      t.category || '',
      t.comment || ''
    ]);
  });

  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();

  // Очистка
  transactions = [];
  localStorage.removeItem("transactions");
  renderTable();
  renderDoughnutChart();
  renderBarChart();
  renderMonthResult();
  document.getElementById("month-result").innerHTML = "";

});


  function renderMonthResult() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    let resultHTML = `<h3>Итоговый результат:</h3>`;
    resultHTML += `<p>Доходы: <strong>${income.toFixed(2)}</strong></p>`;
    resultHTML += `<p>Расходы: <strong>${expense.toFixed(2)}</strong></p>`;
    resultHTML += `<p style="color:${balance >= 0 ? 'green' : 'red'}">${balance >= 0 ? 'Профицит' : 'Дефицит'}: <strong>${balance.toFixed(2)}</strong></p>`;

    if (new Date().getDate() === 1) {
  if (balance >= 0) {
    resultHTML += `<div style="font-size: 48px; animation: bounce 1s infinite;">🏆</div>`;
    resultHTML += `<div style="font-weight: bold; color: green;">Так держать!</div>`;
  } else {
    resultHTML += `<div style="font-size: 48px; animation: bounce 1s infinite;">😞</div>`;
    resultHTML += `<div style="font-weight: bold; color: red;">Попробуй в следующем месяце!</div>`;
  }
}
    document.getElementById("month-result").innerHTML = resultHTML;
  }

  const style = document.createElement("style");
  style.textContent = `@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`;
  document.head.appendChild(style);



  renderTable();
  // renderDoughnutChart();
  // renderLineChart();
  renderMonthResult();
  renderDoughnutChart();
renderBarChart();


  // // Калькулятор
  // const calcBtn = document.createElement("button");
  // calcBtn.textContent = "🧮 Калькулятор";
  // calcBtn.style.margin = "10px";
  // calcBtn.style.padding = "8px 16px";
  // calcBtn.style.borderRadius = "20px";
  // calcBtn.style.border = "none";
  // calcBtn.style.background = "linear-gradient(135deg, #ffa726, #fb8c00)";
  // calcBtn.style.color = "white";
  // calcBtn.style.cursor = "pointer";

  // const calcBox = document.createElement("div");
  // calcBox.style.display = "none";
  // calcBox.style.margin = "10px auto";
  // calcBox.style.maxWidth = "300px";
  // calcBox.style.padding = "20px";
  // calcBox.style.border = "1px solid #ccc";
  // calcBox.style.borderRadius = "12px";
  // calcBox.style.background = "#fff";

  // calcBox.innerHTML = `
  //   <input id="calc-input" type="text" style="width: 100%; padding: 10px; font-size: 1.2em; margin-bottom: 10px;" />
  //   <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
  //     ${[7,8,9,'/',4,5,6,'*',1,2,3,'-','0','.','=','+'].map(c => `<button class="calc-btn">${c}</button>`).join('')}
  //   </div>
  // `;

  // document.querySelector(".container").appendChild(calcBtn);
  // document.querySelector(".container").appendChild(calcBox);

  // calcBtn.addEventListener("click", () => {
  //   calcBox.style.display = calcBox.style.display === "none" ? "block" : "none";
  // });

  // calcBox.addEventListener("click", e => {
  //   if (!e.target.classList.contains("calc-btn")) return;
  //   const input = document.getElementById("calc-input");
  //   const value = e.target.textContent;
  //   if (value === '=') {
  //     try {
  //       input.value = eval(input.value);
  //     } catch {
  //       input.value = 'Ошибка';
  //     }
  //   } else {
  //     input.value += value;
  //   }
  // });
});

// --- Калькулятор ---
const calcDisplay = document.getElementById("calc-display");
const toggleCalcBtn = document.getElementById("toggle-calculator");
const calcBlock = document.getElementById("calculator");
let calcValue = "";

toggleCalcBtn.addEventListener("click", () => {
  calcBlock.style.display = calcBlock.style.display === "none" ? "block" : "none";
});

document.querySelectorAll(".calc-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.textContent;

    if (val === "C") {
      calcValue = "";
    } else if (val === "=") {
      try {
        const result = Function('"use strict";return (' + calcValue + ')')();
        calcValue = result.toString();
        document.getElementById("amount").value = calcValue; // вставка в поле "Сумма"
      } catch (err) {
        calcValue = "Ошибка";
      }
    } else {
      if (calcValue === "Ошибка") calcValue = "";
      calcValue += val;
    }

    calcDisplay.value = calcValue;
  });
});
