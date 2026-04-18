// ==================== TAB SWITCHING ====================
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ==================== BASIC CALCULATOR ====================
let basicExpr = '';
const basicInput = document.getElementById('basic-input');
const basicExpression = document.getElementById('basic-expression');

document.querySelector('#basic .buttons-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'clear':
      basicExpr = '';
      basicExpression.textContent = '';
      basicInput.value = '';
      break;
    case 'delete':
      basicExpr = basicExpr.slice(0, -1);
      basicInput.value = basicExpr;
      break;
    case 'percent':
      try {
        basicExpr = String(eval(basicExpr) / 100);
        basicInput.value = basicExpr;
      } catch { }
      break;
    case 'append':
      basicExpr += value;
      basicInput.value = basicExpr;
      break;
    case 'evaluate':
      try {
        basicExpression.textContent = basicExpr + ' =';
        const result = eval(basicExpr);
        basicExpr = Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(8)));
        basicInput.value = basicExpr;
      } catch {
        basicInput.value = 'Error';
        basicExpr = '';
      }
      break;
  }
});

// ==================== SCIENTIFIC CALCULATOR ====================
let sciExpr = '';
const sciInput = document.getElementById('sci-input');
const sciExpression = document.getElementById('sci-expression');

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

document.querySelector('#scientific .buttons-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'clear':
      sciExpr = '';
      sciExpression.textContent = '';
      sciInput.value = '';
      break;
    case 'delete':
      sciExpr = sciExpr.slice(0, -1);
      sciInput.value = sciExpr;
      break;
    case 'percent':
      try {
        sciExpr = String(eval(sciExpr) / 100);
        sciInput.value = sciExpr;
      } catch { }
      break;
    case 'append':
      sciExpr += value;
      sciInput.value = sciExpr;
      break;
    case 'evaluate':
      try {
        sciExpression.textContent = sciExpr + ' =';
        const result = eval(sciExpr);
        sciExpr = Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(8)));
        sciInput.value = sciExpr;
      } catch {
        sciInput.value = 'Error';
        sciExpr = '';
      }
      break;
    case 'sci':
      try {
        const current = sciExpr ? eval(sciExpr) : 0;
        let result;
        switch (value) {
          case 'sin': result = Math.sin(current * Math.PI / 180); break;
          case 'cos': result = Math.cos(current * Math.PI / 180); break;
          case 'tan': result = Math.tan(current * Math.PI / 180); break;
          case 'log': result = Math.log10(current); break;
          case 'ln': result = Math.log(current); break;
          case 'sqrt': result = Math.sqrt(current); break;
          case 'square': result = current * current; break;
          case 'cube': result = current * current * current; break;
          case 'factorial': result = factorial(Math.floor(current)); break;
          case 'reciprocal': result = 1 / current; break;
          case 'pow':
            sciExpr += '**';
            sciInput.value = sciExpr;
            return;
          case 'pi':
            sciExpr += Math.PI.toFixed(6);
            sciInput.value = sciExpr;
            return;
          case 'e':
            sciExpr += Math.E.toFixed(6);
            sciInput.value = sciExpr;
            return;
        }
        sciExpression.textContent = `${value}(${current})`;
        sciExpr = Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(8)));
        sciInput.value = sciExpr;
      } catch {
        sciInput.value = 'Error';
        sciExpr = '';
      }
      break;
  }
});

// ==================== UNIT CONVERTERS ====================

// --- Length ---
const lengthFactors = {
  m: 1, km: 1000, cm: 0.01, mm: 0.001,
  mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254
};

function convertLength() {
  const val = parseFloat(document.getElementById('length-from').value);
  const from = document.getElementById('length-from-unit').value;
  const to = document.getElementById('length-to-unit').value;
  if (isNaN(val)) { document.getElementById('length-to').value = ''; return; }
  const meters = val * lengthFactors[from];
  const result = meters / lengthFactors[to];
  document.getElementById('length-to').value = parseFloat(result.toFixed(8));
}

document.getElementById('length-from').addEventListener('input', convertLength);
document.getElementById('length-from-unit').addEventListener('change', convertLength);
document.getElementById('length-to-unit').addEventListener('change', convertLength);
document.getElementById('length-swap').addEventListener('click', () => {
  const fromUnit = document.getElementById('length-from-unit');
  const toUnit = document.getElementById('length-to-unit');
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
  convertLength();
});

// --- Weight ---
const weightFactors = {
  kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000
};

function convertWeight() {
  const val = parseFloat(document.getElementById('weight-from').value);
  const from = document.getElementById('weight-from-unit').value;
  const to = document.getElementById('weight-to-unit').value;
  if (isNaN(val)) { document.getElementById('weight-to').value = ''; return; }
  const kg = val * weightFactors[from];
  const result = kg / weightFactors[to];
  document.getElementById('weight-to').value = parseFloat(result.toFixed(8));
}

document.getElementById('weight-from').addEventListener('input', convertWeight);
document.getElementById('weight-from-unit').addEventListener('change', convertWeight);
document.getElementById('weight-to-unit').addEventListener('change', convertWeight);
document.getElementById('weight-swap').addEventListener('click', () => {
  const fromUnit = document.getElementById('weight-from-unit');
  const toUnit = document.getElementById('weight-to-unit');
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
  convertWeight();
});

// --- Temperature ---
function convertTemp() {
  const val = parseFloat(document.getElementById('temp-from').value);
  const from = document.getElementById('temp-from-unit').value;
  const to = document.getElementById('temp-to-unit').value;
  if (isNaN(val)) { document.getElementById('temp-to').value = ''; return; }

  let celsius;
  if (from === 'C') celsius = val;
  else if (from === 'F') celsius = (val - 32) * 5 / 9;
  else celsius = val - 273.15;

  let result;
  if (to === 'C') result = celsius;
  else if (to === 'F') result = celsius * 9 / 5 + 32;
  else result = celsius + 273.15;

  document.getElementById('temp-to').value = parseFloat(result.toFixed(4));
}

document.getElementById('temp-from').addEventListener('input', convertTemp);
document.getElementById('temp-from-unit').addEventListener('change', convertTemp);
document.getElementById('temp-to-unit').addEventListener('change', convertTemp);
document.getElementById('temp-swap').addEventListener('click', () => {
  const fromUnit = document.getElementById('temp-from-unit');
  const toUnit = document.getElementById('temp-to-unit');
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
  convertTemp();
});

// ==================== KEYBOARD SUPPORT ====================
document.addEventListener('keydown', (e) => {
  const activeTab = document.querySelector('.tab.active').dataset.tab;
  if (activeTab !== 'basic' && activeTab !== 'scientific') return;

  const input = activeTab === 'basic' ? basicInput : sciInput;
  const expr = activeTab === 'basic' ? 'basicExpr' : 'sciExpr';

  if (e.key >= '0' && e.key <= '9' || e.key === '.') {
    if (activeTab === 'basic') { basicExpr += e.key; basicInput.value = basicExpr; }
    else { sciExpr += e.key; sciInput.value = sciExpr; }
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    if (activeTab === 'basic') { basicExpr += e.key; basicInput.value = basicExpr; }
    else { sciExpr += e.key; sciInput.value = sciExpr; }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    document.querySelector(`#${activeTab} .btn.equals`).click();
  } else if (e.key === 'Backspace') {
    if (activeTab === 'basic') { basicExpr = basicExpr.slice(0, -1); basicInput.value = basicExpr; }
    else { sciExpr = sciExpr.slice(0, -1); sciInput.value = sciExpr; }
  } else if (e.key === 'Escape') {
    if (activeTab === 'basic') { basicExpr = ''; basicExpression.textContent = ''; basicInput.value = ''; }
    else { sciExpr = ''; sciExpression.textContent = ''; sciInput.value = ''; }
  }
});
