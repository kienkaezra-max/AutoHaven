
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
const money = n => '$' + Number(n).toLocaleString();
async function fetchCars(){ return fetch('data/cars.json').then(r=>r.json()); }
async function fetchFacts(){ return fetch('data/funfacts.json').then(r=>r.json()); }

function mountHeader(){
  const header = document.querySelector('.header');
  header.innerHTML = `
    <div class="brand">
      <a class="logo" href="index.html">AutoHaven</a>
      <nav class="nav">
        <a href="index.html">Home</a>
        <a href="catalog.html">Catalog</a>
        <a href="brands.html">Brands</a>
        <a href="contact.html">Contact</a>
        <a href="checkout.html">Cart</a>
      </nav>
    </div>
    <div class="search">
      <input id="globalSearch" placeholder="Search brand or model… (Enter to view)"/>
      <button class="go" id="searchBtn">Go</button>
      <div class="search-pop" id="searchPop"></div>
    </div>
    <div class="nav">
      <a class="btn" href="signup.html">Sign Up</a>
      <a class="btn" href="login.html">Login</a>
    </div>`;
}

function setupGlobalSearch(cars){
  const input = $('#globalSearch'); const btn = $('#searchBtn'); const pop = $('#searchPop');
  function suggest(matches){
    pop.innerHTML='';
    if(matches.length===0){ pop.innerHTML = '<div class="empty">No matches.</div>'; pop.style.display='block'; return; }
    matches.slice(0,8).forEach(c=>{
      const a = document.createElement('a');
      a.href = 'car.html?slug='+encodeURIComponent(c.slug);
      a.className='item';
      a.innerHTML = `<img src="${c.cdn}"/><div><b>${c.brand} ${c.model}</b><div class="meta"><span>${c.year} • ${c.type}</span><span class="price">${money(c.price)}</span></div></div>`;
      pop.appendChild(a);
    });
    pop.style.display='block';
  }
  function runSuggest(){ 
    const q = (input.value||'').trim().toLowerCase();
    if(!q){ pop.style.display='none'; return; }
    const matches = cars.filter(c => (c.brand+' '+c.model).toLowerCase().includes(q));
    suggest(matches);
  }
  function goToResults(){
    const q = (input.value||'').trim();
    if(!q) return;
    location.href = 'catalog.html?q=' + encodeURIComponent(q);
  }
  input?.addEventListener('input', runSuggest);
  input?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); goToResults(); }});
  btn?.addEventListener('click', goToResults);
  document.addEventListener('click', (e)=>{
    if(!$('.search', document).contains(e.target)) pop.style.display='none';
  });
}

async function initHome(){
  const cars = await fetchCars();
  setupGlobalSearch(cars);

  // Netflix-style rows with arrows
  const rows = [
    {title:'Hypercars', filter:(c)=>['Bugatti','Ferrari','Lamborghini','McLaren','Aston Martin','Porsche','Mercedes‑AMG','Audi','Bentley'].includes(c.brand)},
    {title:'Electric & Hybrid Performance', filter:(c)=>['Tesla','BMW','Ferrari','McLaren','Porsche'].includes(c.brand) || ['Hybrid','Electric'].includes(c.fuel)},
    {title:'Ultra Luxury', filter:(c)=>['Rolls‑Royce','Bentley'].includes(c.brand)}
  ];
  const rowsWrap = $('#rows');
  rows.forEach(row=>{
    const section = document.createElement('section');
    section.className='row';
    section.innerHTML = `<h3>${row.title}</h3><div class="arrow left">‹</div><div class="strip"></div><div class="arrow right">›</div>`;
    rowsWrap.appendChild(section);
    const strip = $('.strip', section);
    const left = $('.arrow.left', section);
    const right = $('.arrow.right', section);
    cars.filter(row.filter).forEach(c=>{
      const a = document.createElement('a');
      a.className='tile'; a.href='car.html?slug='+encodeURIComponent(c.slug);
      a.innerHTML = `<img src="${c.cdn}"/><div class="p"><b>${c.brand} ${c.model}</b><div class="meta"><span>${c.year}</span><span class="price">${money(c.price)}</span></div></div>`;
      strip.appendChild(a);
    });
    const scrollBy = () => strip.scrollBy({left: strip.clientWidth*0.9, behavior:'smooth'});
    const scrollBack = () => strip.scrollBy({left: -strip.clientWidth*0.9, behavior:'smooth'});
    right.addEventListener('click', scrollBy);
    left.addEventListener('click', scrollBack);
  });

  // Fun facts
  const facts = await fetchFacts(); const t = $('#fact'); const btn = $('#nextFact');
  let i = 0; const render = ()=> t.textContent = facts[i];
  btn?.addEventListener('click', ()=>{ i = (i+1)%facts.length; render(); });
  render();
}

async function initCatalog(){
  const cars = await fetchCars(); setupGlobalSearch(cars);
  const q = new URLSearchParams(location.search).get('q')||'';
  const grid = $('#catalogGrid'); grid.innerHTML='';
  const matches = cars.filter(c => (c.brand+' '+c.model).toLowerCase().includes(q.toLowerCase()));
  const list = (q ? matches : cars);
  if(list.length===0){
    grid.innerHTML = '<div class="note">❌ Sorry, that car is not available in AutoHaven yet.</div>';
    return;
  }
  list.forEach(c=>{
    const a = document.createElement('a');
    a.className='card'; a.href='car.html?slug='+encodeURIComponent(c.slug);
    a.innerHTML = `<img src="${c.cdn}"/><div class="p"><b>${c.brand} ${c.model}</b><div class="meta"><span>${c.year} • ${c.type}</span><span class="price">${money(c.price)}</span></div></div>`;
    grid.appendChild(a);
  });
}

async function initCar(){
  const slug = new URLSearchParams(location.search).get('slug');
  const cars = await fetchCars(); setupGlobalSearch(cars);
  const car = cars.find(c=>c.slug===slug);
  if(!car){ $('#carWrap').innerHTML='<p class="note">Car not found.</p>'; return; }
  $('#carWrap').innerHTML = `
    <div class="grid" style="grid-template-columns:1.2fr .8fr; gap:20px">
      <div class="card"><img src="${car.cdn}" style="height:360px; width:100%; object-fit:cover"/></div>
      <div>
        <h1 class="title" style="margin-top:0">${car.brand} ${car.model}</h1>
        <div class="meta"><span>${car.year} • ${car.type}</span><span>${car.hp} hp</span></div>
        <div class="price" style="margin-top:10px">${money(car.price)}</div>
        <button class="btn" id="add">Add to Cart</button>
        <div class="section"><h2>Specifications</h2>
          <table class="table">
            <tr><td>Engine</td><td>${car.engine}</td></tr>
            <tr><td>Fuel</td><td>${car.fuel}</td></tr>
            <tr><td>Transmission</td><td>${car.transmission}</td></tr>
            <tr><td>Body</td><td>${car.type}</td></tr>
            <tr><td>Year</td><td>${car.year}</td></tr>
          </table>
        </div>
      </div>
    </div>`;
  $('#add').addEventListener('click', ()=>{
    const cart = JSON.parse(localStorage.getItem('cart')||'[]'); 
    if(!cart.find(x=>x.slug===car.slug)) cart.push(car);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.href='checkout.html';
  });
}

function renderCart(){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  const list = $('#cartList'); const total = cart.reduce((s,i)=>s+i.price,0);
  list.innerHTML='';
  cart.forEach(i=>{
    const row = document.createElement('div'); row.className='card'; row.style.display='flex'; row.style.gap='12px'; row.style.marginBottom='12px';
    row.innerHTML = `<img src="${i.cdn}" style="width:220px;height:140px;object-fit:cover"/>
      <div class="p" style="flex:1">
        <b>${i.brand} ${i.model}</b>
        <div class="meta"><span>${i.year} • ${i.type}</span><span>${i.hp} hp</span></div>
        <div class="price" style="margin-top:8px">${money(i.price)}</div>
        <button class="btn remove" data-slug="${i.slug}" style="margin-top:8px">Remove</button>
      </div>`;
    list.appendChild(row);
  });
  $('#total').textContent = money(total);
  $$('.remove').forEach(b=> b.addEventListener('click', e=>{
    const slug = e.currentTarget.getAttribute('data-slug');
    const cart = JSON.parse(localStorage.getItem('cart')||'[]').filter(i=>i.slug!==slug);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }));
}

function initCheckout(){
  renderCart();
  $('#orderForm').addEventListener('submit', e=>{
    e.preventDefault();
    localStorage.setItem('lastOrder', JSON.stringify({items: JSON.parse(localStorage.getItem('cart')||'[]'), when: new Date().toISOString()}));
    localStorage.removeItem('cart'); location.href='success.html';
  });
}

async function initBrands(){
  const cars = await fetchCars(); setupGlobalSearch(cars);
  const grid = $('#brandGrid');
  const map = {};
  cars.forEach(c=>{ (map[c.brand]=map[c.brand]||[]).push(c); });
  Object.entries(map).forEach(([brand, list])=>{
    const a = document.createElement('a');
    a.className='card'; a.href='catalog.html?q='+encodeURIComponent(brand);
    a.innerHTML = `<img src="${list[0].cdn}"/><div class="p"><b>${brand}</b><div class="meta"><span>${list.length} model(s)</span><span>→</span></div></div>`;
    grid.appendChild(a);
  });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  mountHeader();
  const cars = await fetchCars();
  setupGlobalSearch(cars);
  const page = document.body.getAttribute('data-page');
  if(page==='home'){ initHome(); }
  if(page==='catalog'){ initCatalog(); }
  if(page==='car'){ initCar(); }
  if(page==='brands'){ initBrands(); }
  if(page==='checkout'){ initCheckout(); }
});
