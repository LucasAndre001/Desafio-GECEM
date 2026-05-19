const btnAdd = document.getElementById('btn-add');
const btnSpin = document.getElementById('btn-spin');
const inputName = document.getElementById('input-name');
const inputWrapper = document.querySelector('.input-wrapper');
const nameList = document.getElementById('name-list');
const resultItems = document.querySelectorAll('#result-list li');
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

let names = [];
const MAX_NAMES = 8;
let spinning = false;
let currentAngle = 0;
let resultCount = 0;

const SLICE_COLORS = ['#FCFC30', '#FFFF99'];
const TEXT_COLOR = '#3D5AFF';

btnAdd.addEventListener('click', addName);
inputName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addName();
});

function addName() {
  const name = inputName.value.trim();

  if (!name) return;
  if (names.length >= MAX_NAMES) {
    alert('Limite de 8 nomes atingido!');
    return;
  }
  if (names.includes(name)) {
    alert('Esse nome já foi adicionado!');
    return;
  }

  names.push(name);
  inputName.value = '';
  inputWrapper.classList.remove('visible');

  renderList();
  drawWheel();
}

function removeName(index) {
  names.splice(index, 1);
  renderList();
  drawWheel();
}

function renderList() {
  nameList.innerHTML = '';

  names.forEach((name, index) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = name;

    const btnRemove = document.createElement('button');
    btnRemove.classList.add('btn-remove');
    btnRemove.innerHTML = '<img src="Assets/lixeira.png" alt="lixeira">';
    btnRemove.addEventListener('click', () => removeName(index));

    li.appendChild(span);
    li.appendChild(btnRemove);
    nameList.appendChild(li);
  });
}

function drawWheel() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = cx - 4;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // roleta vazia
  if (names.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = SLICE_COLORS[0];
    ctx.fill();
    ctx.strokeStyle = '#FCFC30';
    ctx.lineWidth = 4;
    ctx.stroke();
    return;
  }

  const total = names.length;
  const anglePerSlice = (2 * Math.PI) / total;

  names.forEach((name, index) => {
    const startAngle = currentAngle + index * anglePerSlice;
    const endAngle = startAngle + anglePerSlice;

    // alterna as cores das fatias
    const sliceColor = SLICE_COLORS[index % 2];

    // fatia da roleta
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = sliceColor;
    ctx.fill();
    ctx.strokeStyle = '#FCFC30';
    ctx.lineWidth = 2;
    ctx.stroke();

    // texto da roleta
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + anglePerSlice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = `bold ${total > 6 ? '13' : '16'}px Inter`;
    ctx.fillText(name, radius - 10, 5);
    ctx.restore();
  });
}

function spin() {
  if (spinning) return;
  if (names.length < 2) {
    alert('Adicione pelo menos 2 nomes para sortear!');
    return;
  }

  spinning = true;
  btnSpin.disabled = true;

  let speed = Math.random() * 0.15 + 0.25;
  const deceleration = 0.98;

  function animate() {
    currentAngle += speed;
    speed *= deceleration;

    drawWheel();

    if (speed > 0.001) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      btnSpin.disabled = false;
      getWinner();
    }
  }

  requestAnimationFrame(animate);
}

function getWinner() {
  const total = names.length;
  const anglePerSlice = (2 * Math.PI) / total;
  const arrowAngle = -Math.PI / 2; 
  const normalized = ((arrowAngle - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const index = Math.floor(normalized / anglePerSlice) % total;

  const winner = names[index];
  names.splice(index, 1); // remove o vencedor da lista da esquerda
  renderList(); // atualiza a lista de nomes
  drawWheel(); // redesenha a roleta sem o vencedor da rodada


  addResult(winner);
}

function addResult(name) {
  if (resultCount < 3) {
    const item = resultItems[resultCount];
    item.querySelector('span:first-child').textContent = name;
    item.style.visibility = 'visible';
  } else {
    const extraList = document.getElementById('extra-result-list');
    const li = document.createElement('li');
    li.innerHTML = `<span>${name}</span>`;
    extraList.appendChild(li);
  }
  resultCount++;
}

function clearResults() {
  resultCount = 0;
  resultItems.forEach(item => {
    item.querySelector('span:first-child').textContent = '';
    item.style.visibility = 'hidden';
  });
  document.getElementById('extra-result-list').innerHTML = '';
}

btnSpin.addEventListener('click', spin);

drawWheel();