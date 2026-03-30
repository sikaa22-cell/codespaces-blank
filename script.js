import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://stbdqxydmzlflnvsogde.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_-mQj4leakzhkMZNuiAgYZg_EARP4OUD';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PACKAGING_FEE = 200; // Csomagolási díj rögzítve 
const TOPPING_PRICE = 400;

let menuData = [];
let cart = [];
let currentSelectedItem = null;

// --- CSAK EZEN ÉTELEKNÉL JELENIK MEG A KÖRETVÁLASZTÓ ---
const koretesEtelek = [
    'Roston sült csirkemell, párolt jázmin rizs és kompót',
    'Rántott sajt, párolt jázmin rizs, tartár mártás',
    'Óriás rántott sertés karaj, rizs, borsó és házi csalamádé',
    'Lazac burger, guacamole, uborka, lollo saláta',
    'Vegan cheese burger, cékla ketchup',
    '"Bacon and Cheese" Beef Burger'
];

const sideDishes = [
    'Hasábburgonya', 
    'Jázmin rizs', 
    'Édesburgonya', 
    'Kéksajtos rukkolás burgonyapüré', 
    'Házi steak burgonya'
];

const pizzaToppings = ['Sajt', 'Sonka', 'Gomba', 'Kukorica', 'Hagyma', 'Szalámi', 'Bacon', 'Ananász', 'Jalapeno', 'Olívabogyó', 'Tonhal', 'Tojás', 'Paradicsom', 'Paprika', 'Csirkemell', 'Rukkola', 'Parmezán', 'Fokhagyma', 'Tejföl', 'BBQ', 'Erős Pista', 'Kolbász'];

document.addEventListener('DOMContentLoaded', async () => {
    const { data, error } = await supabase.from('etlap').select('*');
    if (!error) {
        menuData = data;
        renderCategories();
        if(menuData.length > 0) renderMenu(menuData[0].kategoria);
    }
});

function renderCategories() {
    const categories = [...new Set(menuData.map(item => item.kategoria))];
    const nav = document.getElementById('category-nav');
    nav.innerHTML = '';
    categories.forEach((cat, i) => {
        const btn = document.createElement('button');
        btn.className = 'category-btn' + (i === 0 ? ' active' : '');
        btn.innerText = cat;
        btn.onclick = (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMenu(cat);
        };
        nav.appendChild(btn);
    });
}

function renderMenu(category) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    menuData.filter(i => i.kategoria === category).forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `<h3>${item.nev}</h3><p class="gold-text">${item.ar} Ft</p>`;
        div.onclick = () => openModal(item);
        container.appendChild(div);
    });
}

function openModal(item) {
    currentSelectedItem = item;
    document.getElementById('modal-title').innerText = item.nev;
    document.getElementById('modal-price').innerText = `${item.ar} Ft`;
    const options = document.getElementById('modal-options');
    options.innerHTML = '';

    if (item.kategoria === 'Pizzák') {
        options.innerHTML = '<div class="topping-grid"></div>';
        const grid = options.querySelector('.topping-grid');
        pizzaToppings.forEach(t => {
            grid.innerHTML += `<label class="topping-label"><input type="checkbox" value="${t}" class="pizza-topping"> ${t}</label>`;
        });
    } else if (koretesEtelek.includes(item.nev)) {
        options.innerHTML = `
            <h4>Válassz köretet:</h4>
            <select id="side-dish-select" style="width:100%; padding:0.8rem; margin-top:0.5rem; background:#2a2a2a; color:white; border:1px solid var(--gold);">
                <option value="Eredeti körettel">Eredeti körettel kérem</option>
                ${sideDishes.map(sd => `<option value="${sd}">${sd}</option>`).join('')}
            </select>
        `;
    }
    document.getElementById('product-modal').style.display = 'flex';
}

document.querySelector('.close-modal').onclick = () => document.getElementById('product-modal').style.display = 'none';

document.getElementById('add-to-cart-btn').onclick = () => {
    let price = currentSelectedItem.ar + PACKAGING_FEE;
    let desc = '';
    if (currentSelectedItem.kategoria === 'Pizzák') {
        const selected = Array.from(document.querySelectorAll('.pizza-topping:checked')).map(c => c.value);
        price += selected.length * TOPPING_PRICE;
        if(selected.length > 0) desc = ` (+ ${selected.join(', ')})`;
    } else if (koretesEtelek.includes(currentSelectedItem.nev)) {
        const koret = document.getElementById('side-dish-select').value;
        if(koret !== 'Eredeti körettel') desc = ` (Köret: ${koret})`;
    }
    cart.push({ nev: currentSelectedItem.nev + desc, ar: price });
    updateCartUI();
    document.getElementById('product-modal').style.display = 'none';
};

window.removeFromCart = (index) => { cart.splice(index, 1); updateCartUI(); };

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0;
    cart.forEach((item, i) => {
        total += item.ar;
        container.innerHTML += `<div class="cart-item"><span>${item.nev}</span><span>${item.ar} Ft <button class="remove-btn" onclick="removeFromCart(${i})">×</button></span></div>`;
    });
    document.getElementById('total-price').innerText = `${total} Ft`;
}

document.getElementById('cart-icon').onclick = () => document.getElementById('cart-sidebar').classList.add('open');
document.querySelector('.close-cart').onclick = () => document.getElementById('cart-sidebar').classList.remove('open');

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const finalTotal = cart.reduce((s, i) => s + i.ar, 0);
    const address = document.getElementById('order-address').value;
    const floor = document.getElementById('order-floor').value;
    const bell = document.getElementById('order-bell').value;
    const fullAddress = `${address}${floor ? ', Em/Ajtó: ' + floor : ''}${bell ? ', Csengő: ' + bell : ''}`;

    const order = {
        nev: document.getElementById('order-name').value,
        cim: fullAddress,
        telefon: document.getElementById('order-phone').value,
        fizetesi_mod: document.getElementById('order-payment').value,
        tetelek: cart,
        vegosszeg: finalTotal
    };
    const { error } = await supabase.from('rendelesek').insert([order]);
    if(!error) { alert('Sikeres rendelés!'); cart = []; updateCartUI(); document.getElementById('cart-sidebar').classList.remove('open'); e.target.reset(); }
});